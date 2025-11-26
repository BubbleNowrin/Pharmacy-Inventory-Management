import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Medication from '@/models/Medication';
import Sale from '@/models/Sale';
import Purchase from '@/models/Purchase';
import { generateDemandForecast, generateInventoryInsights } from '@/lib/ai/groq-service';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';
    const medicationId = searchParams.get('medicationId');

    // Get medication data
    const medications = medicationId 
      ? await Medication.findById(medicationId)
      : await Medication.find({}).limit(20); // Limit for AI processing

    if (!medications) {
      return NextResponse.json({ error: 'Medications not found' }, { status: 404 });
    }

    const medicationList = Array.isArray(medications) ? medications : [medications];

    // Get sales history for the past 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const salesHistory = await Sale.aggregate([
      { $match: { createdAt: { $gte: threeMonthsAgo } } },
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
        $project: {
          date: '$createdAt',
          medicineName: '$medication.name',
          category: '$medication.category',
          quantity: 1,
          medicineId: 1
        }
      },
      { $sort: { date: -1 } }
    ]);

    // Calculate sales statistics for each medication
    const medicationData = medicationList.map(med => {
      const medSales = salesHistory.filter(sale => 
        sale.medicineId.toString() === med._id.toString()
      );
      
      const totalSales = medSales.reduce((sum, sale) => sum + sale.quantity, 0);
      const averageMonthlySales = totalSales / 3;
      
      // Last month sales
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthSales = medSales
        .filter(sale => new Date(sale.date) >= lastMonth)
        .reduce((sum, sale) => sum + sale.quantity, 0);

      // Determine trend
      const previousMonthSales = medSales
        .filter(sale => {
          const saleDate = new Date(sale.date);
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
          return saleDate >= twoMonthsAgo && saleDate < lastMonth;
        })
        .reduce((sum, sale) => sum + sale.quantity, 0);

      let seasonalTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (lastMonthSales > previousMonthSales * 1.2) {
        seasonalTrend = 'increasing';
      } else if (lastMonthSales < previousMonthSales * 0.8) {
        seasonalTrend = 'decreasing';
      }

      return {
        name: med.name,
        category: med.category,
        quantity: med.quantity,
        lowStockThreshold: med.lowStockThreshold,
        averageMonthlySales,
        lastMonthSales,
        seasonalTrend
      };
    });

    // Generate AI forecasts
    const forecasts = await generateDemandForecast(
      medicationData,
      salesHistory,
      timeframe as 'week' | 'month' | 'quarter'
    );

    // Add medication IDs to forecasts
    const enhancedForecasts = forecasts.map(forecast => {
      const medication = medicationList.find(med => med.name === forecast.medicationName);
      return {
        ...forecast,
        medicationId: medication?._id.toString() || '',
        category: medication?.category || '',
        supplier: medication?.supplier || ''
      };
    });

    // Generate insights
    const insights = await generateInventoryInsights(
      medicationList,
      salesHistory,
      [] // We'll add purchase data if needed
    );

    return NextResponse.json({
      forecasts: enhancedForecasts,
      insights,
      metadata: {
        timeframe,
        medicationsAnalyzed: medicationList.length,
        salesDataPoints: salesHistory.length,
        analysisDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in AI forecast API:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI forecast' },
      { status: 500 }
    );
  }
}
