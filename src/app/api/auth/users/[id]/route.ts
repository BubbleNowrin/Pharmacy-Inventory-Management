import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { success: false, error: 'Invalid or expired token - please login again' },
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

    const { id } = await params;
    const { name, email, password, role } = await request.json();

    // Validate required fields (password is optional for updates)
    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Prevent editing your own account
    if (id === currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Cannot edit your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it already exists
    if (email.toLowerCase() !== userToUpdate.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Another user with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role
    };

    // Only update password if provided
    if (password && password.trim()) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      message: `User "${updatedUser.name}" updated successfully`,
      data: updatedUser
    });

  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
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
        { success: false, error: 'Invalid or expired token - please login again' },
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

    const { id } = await params;

    // Prevent self-deletion
    if (id === currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `User "${userToDelete.name}" deleted successfully`
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}