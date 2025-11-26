import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Purchase from '@/models/Purchase';
import InventoryLog from '@/models/InventoryLog';
import Medication from '@/models/Medication';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    // Sales Analytics
    const salesData = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Purchases Analytics
    const purchasesData = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalPurchases: { $sum: '$totalCost' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top Selling Medications
    const topSelling = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$medicineId',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          salesCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'medications',
          localField: '_id',
          foreignField: '_id',
          as: 'medication'
        }
      },
      { $unwind: '$medication' },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // Category Performance
    const categoryPerformance = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'medications',
          localField: 'medicineId',
          foreignField: '_id',
          as: 'medication'
        }
      },
      { $unwind: '$medication' },
      {
        $group: {
          _id: '$medication.category',
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          salesCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Monthly trends for the past 6 months
    const sixMonthsAgo = subDays(endDate, 180);
    const monthlyTrends = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Stock movement analytics
    const stockMovements = await InventoryLog.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          totalQuantity: { $sum: { $abs: '$quantityChanged' } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Inventory summary
    const inventorySummary = await Medication.aggregate([
      {
        $group: {
          _id: null,
          totalMedications: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          lowStockCount: {
            $sum: {
              $cond: [
                { $lt: ['$quantity', '$lowStockThreshold'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      dailySales: salesData,
      dailyPurchases: purchasesData,
      topSellingMedications: topSelling,
      categoryPerformance,
      monthlyTrends,
      stockMovements,
      inventorySummary: inventorySummary[0] || {
        totalMedications: 0,
        totalQuantity: 0,
        totalValue: 0,
        lowStockCount: 0
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
