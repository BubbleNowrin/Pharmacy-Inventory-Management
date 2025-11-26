import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid supplier ID' },
        { status: 400 }
      );
    }

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: supplier
    });

  } catch (error: any) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supplier' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid supplier ID' },
        { status: 400 }
      );
    }

    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      taxId,
      paymentTerms,
      isActive
    } = body;

    // Validate required fields
    if (!name || !contactPerson || !email || !phone || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email is being changed and if it already exists
    const existingSupplier = await Supplier.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: id }
    });

    if (existingSupplier) {
      return NextResponse.json(
        { success: false, error: 'Another supplier with this email already exists' },
        { status: 400 }
      );
    }

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: country || 'USA',
        taxId: taxId?.trim(),
        paymentTerms: paymentTerms || 'Net 30',
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });

  } catch (error: any) {
    console.error('Error updating supplier:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Supplier with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid supplier ID' },
        { status: 400 }
      );
    }

    // Instead of hard delete, we'll deactivate the supplier
    // This preserves data integrity with existing purchases
    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Supplier deactivated successfully',
      data: supplier
    });

  } catch (error: any) {
    console.error('Error deactivating supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deactivate supplier' },
      { status: 500 }
    );
  }
}