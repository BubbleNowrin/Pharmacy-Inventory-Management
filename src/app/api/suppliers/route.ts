import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Supplier from '@/models/Supplier';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const active = searchParams.get('active');

    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    if (active !== null && active !== undefined && active !== '') {
      query.isActive = active === 'true';
    }

    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Supplier.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: suppliers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
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
      isActive = true
    } = body;

    // Validate required fields
    if (!name || !contactPerson || !email || !phone || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if supplier with same email already exists
    const existingSupplier = await Supplier.findOne({ email: email.toLowerCase() });
    if (existingSupplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier with this email already exists' },
        { status: 400 }
      );
    }

    const supplier = new Supplier({
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
      isActive
    });

    await supplier.save();

    return NextResponse.json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating supplier:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Supplier with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}