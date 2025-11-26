import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Check for authentication token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : 
                  request.cookies.get('token')?.value;


    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user info
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    const currentUser = await User.findById(decoded.userId).select('-password');

    if (!currentUser) {
      const count = await User.countDocuments();
      console.log(`User not found in database. JWT userId: ${decoded.userId}`);
      console.log(`Available users count: ${count}`);
      
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    // Only admins can access user list
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    // Fetch all users (exclude passwords)
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

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
    
    // Check for authentication token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : 
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user info
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    const currentUser = await User.findById(decoded.userId).select('-password');

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin role required.' },
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // The User model will hash this automatically
      role
    });

    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password');

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: userResponse
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
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}