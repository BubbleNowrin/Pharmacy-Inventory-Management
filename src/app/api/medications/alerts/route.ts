import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Medication from '@/models/Medication';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get all medications and filter in JavaScript due to date storage issues
    const allMedications = await Medication.find({}).select('name quantity lowStockThreshold category expiryDate batchNumber');
    
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setUTCDate(thirtyDaysFromNow.getUTCDate() + 30);
    thirtyDaysFromNow.setUTCHours(23, 59, 59, 999);
    
    // Filter medications with low stock
    const lowStockMedications = allMedications.filter(med => 
      med.quantity <= med.lowStockThreshold
    );
    
    // Filter medications expiring soon and sort by expiry date (most urgent first)
    const expiringMedications = allMedications.filter(med => {
      const expiryDate = new Date(med.expiryDate);
      return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    }).sort((a, b) => {
      const dateA = new Date(a.expiryDate);
      const dateB = new Date(b.expiryDate);
      return dateA - dateB; // Sort ascending (earliest expiry first)
    });
    
    // Filter expired medications
    const expiredMedications = allMedications.filter(med => {
      const expiryDate = new Date(med.expiryDate);
      return expiryDate < today;
    });
    
    // Debug: Check all medications first
    console.log('All medications found:', allMedications.length);
    console.log('Sample medications:', allMedications.slice(0, 3).map(m => ({
      name: m.name,
      expiryDate: m.expiryDate,
      quantity: m.quantity,
      lowStockThreshold: m.lowStockThreshold
    })));

    console.log('Alert Data:', {
      lowStockCount: lowStockMedications.length,
      expiringSoonCount: expiringMedications.length,
      expiredCount: expiredMedications.length,
      today: today.toISOString(),
      thirtyDaysFromNow: thirtyDaysFromNow.toISOString(),
      totalMedicationsInAlerts: allMedications.length
    });
    
    return NextResponse.json({
      lowStock: lowStockMedications,
      expiringSoon: expiringMedications,
      expired: expiredMedications,
      summary: {
        lowStockCount: lowStockMedications.length,
        expiringSoonCount: expiringMedications.length,
        expiredCount: expiredMedications.length,
      },
      debug: {
        today: today.toISOString(),
        thirtyDaysFromNow: thirtyDaysFromNow.toISOString(),
        totalMedicationsInAlerts: allMedications.length
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}