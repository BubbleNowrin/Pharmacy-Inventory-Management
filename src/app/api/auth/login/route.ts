import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Pharmacy from '@/models/Pharmacy'; // Required for populate to work
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Ensure Pharmacy model is registered
    const _pharmacy = Pharmacy;
    
    const { email, password } = await request.json();
    
    // Find user with pharmacy info
    const user = await User.findOne({ email }).populate('pharmacyId');
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Check if pharmacy is active (except for super admin)
    if (user.role !== 'super_admin' && user.pharmacyId && !(user.pharmacyId as any).isActive) {
      return NextResponse.json(
        { error: 'Pharmacy account is deactivated' },
        { status: 401 }
      );
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      pharmacyId: user.pharmacyId?._id?.toString() || user.pharmacyId?.toString(),
    });
    
    // Create response with token in HTTP-only cookie
    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacyId: user.pharmacyId?._id,
        pharmacy: user.role !== 'super_admin' ? {
          id: (user.pharmacyId as any)?._id,
          name: (user.pharmacyId as any)?.name,
          licenseNumber: (user.pharmacyId as any)?.licenseNumber,
        } : null,
      },
    });
    
    // Set HTTP-only cookie for security
    response.cookies.set('token', token, {
      httpOnly: false, // Changed to false to allow client-side access if needed, or keep true and rely on localStorage
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}