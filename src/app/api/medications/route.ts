import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Medication from '@/models/Medication';
import { getTenantContext, validateTenantAccess, buildTenantQuery, addTenantData } from '@/lib/multi-tenant-utils';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Validate tenant access
    const context = getTenantContext(request);
    const validation = validateTenantAccess(context);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    
    const skip = (page - 1) * limit;
    
    // Build query with tenant filtering
    let baseQuery: any = {};
    
    if (search) {
      baseQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      baseQuery.category = category;
    }
    
    const query = buildTenantQuery(context, baseQuery);
    
    const medications = await Medication.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Medication.countDocuments(query);
    
    return NextResponse.json({
      medications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Validate tenant access
    const context = getTenantContext(request);
    const validation = validateTenantAccess(context);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Add tenant data
    const medicationData = addTenantData(context, data);
    const medication = await Medication.create(medicationData);
    
    return NextResponse.json({
      message: 'Medication created successfully',
      medication,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}