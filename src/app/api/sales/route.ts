import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Medication from '@/models/Medication';
import { createInventoryLog } from '@/lib/inventory-server-utils';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Extract pharmacyId from headers set by middleware
    const pharmacyId = request.headers.get('x-pharmacy-id');
    if (!pharmacyId) {
      return NextResponse.json(
        { error: 'Pharmacy ID required' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    const sales = await Sale.find({ pharmacyId })
      .populate('medicineId', 'name category unit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Transform the data to include medication info
    const transformedSales = sales.map(sale => ({
      ...sale.toObject(),
      medication: sale.medicineId
    }));
    
    const total = await Sale.countDocuments({ pharmacyId });
    
    return NextResponse.json({
      sales: transformedSales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
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
    
    // Extract pharmacyId from headers set by middleware
    const pharmacyId = request.headers.get('x-pharmacy-id');
    if (!pharmacyId) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Pharmacy ID required' },
        { status: 400 }
      );
    }
    
    const { medicineId, quantity, unitPrice, customerName } = await request.json();
    
    // Validate required fields
    if (!medicineId || !quantity || !unitPrice) {
      return NextResponse.json(
        { error: 'Medicine ID, quantity, and unit price are required' },
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

    // Calculate total amount
    const totalAmount = quantity * unitPrice;

    // Create the sale record
    const sale = new Sale({
      pharmacyId,
      medicineId,
      quantity,
      unitPrice,
      totalAmount,
      customerName,
    });

    await sale.save({ session });

    // Update medication stock (deduct quantity)
    const updatedMedication = await Medication.findByIdAndUpdate(
      medicineId,
      { 
        $inc: { quantity: -quantity },
        $set: { updatedAt: new Date() }
      },
      { session, new: true }
    );

    // Create inventory log entry
    await createInventoryLog(
      pharmacyId,
      medicineId,
      'sale',
      -quantity, // Negative quantity for sales
      medication.quantity,
      medication.quantity - quantity,
      sale._id.toString(),
      {
        unitPrice,
        totalAmount,
        notes: customerName ? `Sale to customer: ${customerName}` : 'Sale transaction',
        batchNumber: medication.batchNumber,
        session
      }
    );

    // Commit the transaction
    await session.commitTransaction();

    // Populate the sale with medication info for response
    await sale.populate('medicineId', 'name category unit');

    return NextResponse.json({
      message: 'Sale recorded successfully',
      sale: {
        ...sale.toObject(),
        medication: sale.medicineId
      },
    }, { status: 201 });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error recording sale:', error);
    
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
