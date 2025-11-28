import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Pharmacy from '@/models/Pharmacy';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

// GET - List all pharmacies (super admin only)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
      ];
    }

    const pharmacies = await Pharmacy.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Pharmacy.countDocuments(query);

    return NextResponse.json({
      pharmacies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Register new pharmacy
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const { 
      pharmacy, 
      adminUser 
    } = data;

    // Validate required fields
    if (!pharmacy?.name || !pharmacy?.licenseNumber || !pharmacy?.email || 
        !adminUser?.name || !adminUser?.email || !adminUser?.password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Attempting to register pharmacy with email:', pharmacy.email);

    // Check if pharmacy with same license number or email exists
    const existingPharmacy = await Pharmacy.findOne({
      $or: [
        { licenseNumber: pharmacy.licenseNumber.toUpperCase() },
        { email: pharmacy.email.toLowerCase() }
      ]
    });

    if (existingPharmacy) {
      return NextResponse.json(
        { error: 'Pharmacy with this license number or email already exists' },
        { status: 409 }
      );
    }

    // Check if admin user email exists
    const existingUser = await User.findOne({ 
      email: adminUser.email.toLowerCase() 
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create pharmacy
    const newPharmacy = await Pharmacy.create({
      ...pharmacy,
      licenseNumber: pharmacy.licenseNumber.toUpperCase(),
      email: pharmacy.email.toLowerCase(),
    });

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);

    // Create pharmacy admin user
    const adminUserData = await User.create({
      ...adminUser,
      email: adminUser.email.toLowerCase(),
      password: hashedPassword,
      role: 'pharmacy_admin',
      pharmacyId: newPharmacy._id,
    });

    // Generate JWT token for immediate login
    const token = await signToken({
      userId: adminUserData._id.toString(),
      email: adminUserData.email,
      role: adminUserData.role,
      pharmacyId: newPharmacy._id.toString(),
    });

    return NextResponse.json({
      message: 'Pharmacy registered successfully',
      pharmacy: newPharmacy,
      user: {
        id: adminUserData._id,
        name: adminUserData.name,
        email: adminUserData.email,
        role: adminUserData.role,
        pharmacyId: newPharmacy._id,
        pharmacy: {
          id: newPharmacy._id,
          name: newPharmacy.name,
          licenseNumber: newPharmacy.licenseNumber,
        }
      },
      token,
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering pharmacy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}