import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { getTenantContext, validateTenantAccess, buildTenantQuery } from '@/lib/multi-tenant-utils';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Validate tenant access
    const context = getTenantContext(request);
    console.log('GET /api/auth/users - Tenant context:', context);
    
    const validation = validateTenantAccess(context);
    
    if (!validation.isValid) {
      console.error('GET /api/auth/users - Validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Only pharmacy_admin or super_admin can access user list for their pharmacy
    if (context.userRole !== 'pharmacy_admin' && context.userRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. Pharmacy admin role required.' },
        { status: 403 }
      );
    }

    // Build query to get users from the same pharmacy
    const query = buildTenantQuery(context);
    const users = await User.find(query)
      .select('-password')
      .populate('pharmacyId', 'name licenseNumber')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users
    });

  } catch (error: any) {
    console.error('Error fetching users:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Validate tenant access
    const context = getTenantContext(request);
    console.log('POST /api/auth/users - Tenant context:', context);
    
    const validation = validateTenantAccess(context);
    
    if (!validation.isValid) {
      console.error('POST /api/auth/users - Validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Only pharmacy_admin or super_admin can create users for their pharmacy
    if (context.userRole !== 'pharmacy_admin' && context.userRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. Pharmacy admin role required.' },
        { status: 403 }
      );
    }

    const { name, email, password, role } = await request.json();

    // Validate required fields (password is optional for updates)
    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // For new users, password is required
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required for new users' },
        { status: 400 }
      );
    }

    // Check if user already exists in this pharmacy
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      pharmacyId: context.pharmacyId 
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists in your pharmacy' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with pharmacy association
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      pharmacyId: context.pharmacyId,
      isActive: true
    });

    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('pharmacyId', 'name licenseNumber');

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}