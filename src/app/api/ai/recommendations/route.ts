import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Medication from '@/models/Medication';
import Sale from '@/models/Sale';
import { generateSmartRecommendations } from '@/lib/ai/groq-service';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const medicationId = searchParams.get('medicationId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (medicationId) {
      // Get specific medication recommendation
      const medication = await Medication.findById(medicationId);
      if (!medication) {
        return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
      }

      // Get recent sales for this medication
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const recentSales = await Sale.find({
        medicineId: medicationId,
        createdAt: { $gte: oneMonthAgo }
      }).select('quantity createdAt').sort({ createdAt: -1 });

      const salesData = recentSales.map(sale => ({
        quantity: sale.quantity,
        date: sale.createdAt.toISOString().split('T')[0]
      }));

      const recommendation = await generateSmartRecommendations(
        medication.name,
        medication.quantity,
        salesData,
        medication.category
      );

      return NextResponse.json({
        medicationId,
        medicationName: medication.name,
        recommendation
      });
    } else {
      // Get recommendations for all medications with issues
      const medications = await Medication.find({}).limit(limit);
      
      const recommendations = await Promise.all(
        medications.map(async (med) => {
          // Get recent sales
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

          const recentSales = await Sale.find({
            medicineId: med._id,
            createdAt: { $gte: oneMonthAgo }
          }).select('quantity createdAt').limit(30);

          const salesData = recentSales.map(sale => ({
            quantity: sale.quantity,
            date: sale.createdAt.toISOString().split('T')[0]
          }));

          try {
            const recommendation = await generateSmartRecommendations(
              med.name,
              med.quantity,
              salesData,
              med.category
            );

            return {
              medicationId: med._id.toString(),
              medicationName: med.name,
              category: med.category,
              currentStock: med.quantity,
              lowStockThreshold: med.lowStockThreshold,
              recommendation
            };
          } catch (error) {
            console.error(`Error generating recommendation for ${med.name}:`, error);
            return null;
          }
        })
      );

      // Filter out null recommendations and sort by priority
      const validRecommendations = recommendations
        .filter(rec => rec !== null)
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.recommendation.priority] - priorityOrder[a.recommendation.priority];
        });

      return NextResponse.json({
        recommendations: validRecommendations,
        count: validRecommendations.length
      });
    }

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
