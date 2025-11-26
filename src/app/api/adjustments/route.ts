import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Medication from '@/models/Medication';
import { createInventoryLog } from '@/lib/inventory-server-utils';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    // Get inventory logs of type adjustment, expired, or damaged
    const { default: InventoryLog } = await import('@/models/InventoryLog');
    
    const adjustments = await InventoryLog.find({
      type: { $in: ['adjustment', 'expired', 'damaged'] }
    })
      .populate('medicineId', 'name category unit')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Transform the data to include medication info
    const transformedAdjustments = adjustments.map(adj => ({
      ...adj.toObject(),
      medication: adj.medicineId,
      reason: adj.notes || 'Stock adjustment'
    }));
    
    const total = await InventoryLog.countDocuments({
      type: { $in: ['adjustment', 'expired', 'damaged'] }
    });
    
    return NextResponse.json({
      adjustments: transformedAdjustments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching adjustments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    
    const { 
      medicineId, 
      type, 
      quantity, 
      reason,
      notes 
    } = await request.json();
    
    // Validate required fields
    if (!medicineId || !type || !quantity || !reason) {
      return NextResponse.json(
        { error: 'Medicine ID, type, quantity, and reason are required' },
        { status: 400 }
      );
    }

    if (!['adjustment', 'expired', 'damaged'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid adjustment type' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // Find the medication and check availability
    const medication = await Medication.findById(medicineId).session(session);
    if (!medication) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }

    // Check if there's sufficient stock
    if (medication.quantity < quantity) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: `Insufficient stock. Only ${medication.quantity} ${medication.unit}(s) available` },
        { status: 400 }
      );
    }

    // Update medication stock (deduct quantity)
    await Medication.findByIdAndUpdate(
      medicineId,
      { 
        $inc: { quantity: -quantity },
        $set: { updatedAt: new Date() }
      },
      { session }
    );

    // Create inventory log entry
    const adjustmentId = new mongoose.Types.ObjectId().toString();
    await createInventoryLog(
      medicineId,
      type,
      -quantity, // Negative quantity for adjustments (removing stock)
      medication.quantity,
      medication.quantity - quantity,
      adjustmentId,
      {
        notes: `${reason}${notes ? ` - ${notes}` : ''}`,
        batchNumber: medication.batchNumber,
        session
      }
    );

    // Commit the transaction
    await session.commitTransaction();

    return NextResponse.json({
      message: 'Adjustment recorded successfully',
      adjustment: {
        _id: adjustmentId,
        medicineId,
        type,
        quantity,
        previousQuantity: medication.quantity,
        newQuantity: medication.quantity - quantity,
        reason,
        notes,
        date: new Date().toISOString()
      },
    }, { status: 201 });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error recording adjustment:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
