import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
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
    
    const purchases = await Purchase.find({})
      .populate('medicineId', 'name category unit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Transform the data to include medication info
    const transformedPurchases = purchases.map(purchase => ({
      ...purchase.toObject(),
      medication: purchase.medicineId
    }));
    
    const total = await Purchase.countDocuments({});
    
    return NextResponse.json({
      purchases: transformedPurchases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
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
      quantity, 
      unitPrice, 
      supplier, 
      batchNumber, 
      expiryDate 
    } = await request.json();
    
    // Validate required fields
    if (!medicineId || !quantity || !unitPrice || !supplier || !batchNumber || !expiryDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    if (unitPrice < 0) {
      return NextResponse.json(
        { error: 'Unit price cannot be negative' },
        { status: 400 }
      );
    }

    // Validate expiry date
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiry <= today) {
      return NextResponse.json(
        { error: 'Expiry date must be in the future' },
        { status: 400 }
      );
    }

    // Find the medication
    const medication = await Medication.findById(medicineId).session(session);
    if (!medication) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }

    // Calculate total amount
    const totalAmount = quantity * unitPrice;

    // Create the purchase record
    const purchase = new Purchase({
      medicineId,
      quantity,
      unitPrice,
      totalAmount,
      supplier,
      batchNumber,
      expiryDate,
    });

    await purchase.save({ session });

    // Update medication stock (add quantity) and other details
    const updatedMedication = await Medication.findByIdAndUpdate(
      medicineId,
      { 
        $inc: { quantity: quantity },
        $set: { 
          supplier,
          batchNumber,
          expiryDate,
          price: unitPrice, // Update the selling price based on purchase
          updatedAt: new Date()
        }
      },
      { session, new: true }
    );

    // Create inventory log entry
    await createInventoryLog(
      medicineId,
      'purchase',
      quantity, // Positive quantity for purchases
      medication.quantity,
      medication.quantity + quantity,
      purchase._id.toString(),
      {
        unitPrice,
        totalAmount,
        notes: `Purchase from supplier: ${supplier}`,
        batchNumber,
        session
      }
    );

    // Commit the transaction
    await session.commitTransaction();

    // Populate the purchase with medication info for response
    await purchase.populate('medicineId', 'name category unit');

    return NextResponse.json({
      message: 'Purchase recorded successfully',
      purchase: {
        ...purchase.toObject(),
        medication: purchase.medicineId
      },
    }, { status: 201 });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error recording purchase:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        { error: 'Batch number already exists' },
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
