import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InventoryLog from '@/models/InventoryLog';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const medicineId = searchParams.get('medicineId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const skip = (page - 1) * limit;
    const query: any = {};
    if (medicineId) query.medicineId = medicineId;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const logs = await InventoryLog.find(query)
      .populate('medicineId', 'name category unit batchNumber')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const transformedLogs = logs.map(log => ({ ...log.toObject(), medication: log.medicineId }));
    const total = await InventoryLog.countDocuments(query);
    return NextResponse.json({
      logs: transformedLogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}