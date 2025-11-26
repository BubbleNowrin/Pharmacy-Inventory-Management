import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Medication from '@/models/Medication';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Parse natural language query into MongoDB query
    const mongoQuery = parseNaturalLanguageQuery(query.toLowerCase());
    
    console.log('Parsed query:', mongoQuery);

    // Execute the query
    const medications = await Medication.find(mongoQuery)
      .sort({ name: 1 })
      .limit(50)
      .lean();

    // Add computed fields for expiring and low stock status
    const enrichedResults = medications.map(med => {
      const expiryDate = new Date(med.expiryDate);
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      return {
        ...med,
        isExpiring: expiryDate <= thirtyDaysFromNow && expiryDate > today,
        isLowStock: med.quantity <= (med.lowStockThreshold || 10)
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedResults,
      message: `Found ${enrichedResults.length} medications matching your search`
    });

  } catch (error: any) {
    console.error('Smart search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process search query' },
      { status: 500 }
    );
  }
}

function parseNaturalLanguageQuery(query: string): any {
  const mongoQuery: any = {};
  const conditions: any[] = [];

  // Category patterns
  const categoryPatterns = {
    'painkiller': /painkiller|pain relief|analgesic|ibuprofen|paracetamol|aspirin/,
    'antibiotic': /antibiotic|antimicrobial|penicillin|amoxicillin/,
    'vitamin': /vitamin|supplement|multivitamin/,
    'heart': /heart|cardiac|cardiovascular|blood pressure|hypertension/,
    'diabetes': /diabetes|insulin|blood sugar|diabetic/,
    'tablet': /tablet|pill|capsule/,
    'syrup': /syrup|liquid|suspension/,
    'injection': /injection|injectable|ampoule/
  };

  // Check for category matches
  for (const [category, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(query)) {
      conditions.push({
        $or: [
          { category: { $regex: category, $options: 'i' } },
          { name: { $regex: category, $options: 'i' } }
        ]
      });
      break;
    }
  }

  // Expiry patterns
  if (/expir(ing|ed)|expire/i.test(query)) {
    const today = new Date();
    
    if (/next month|30 days/i.test(query)) {
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      conditions.push({
        expiryDate: { $lte: thirtyDaysFromNow, $gte: today }
      });
    } else if (/7 days|week|soon/i.test(query)) {
      const sevenDaysFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
      conditions.push({
        expiryDate: { $lte: sevenDaysFromNow, $gte: today }
      });
    } else if (/expired/i.test(query)) {
      conditions.push({
        expiryDate: { $lt: today }
      });
    } else {
      // Default to next 30 days for "expiring"
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
      conditions.push({
        expiryDate: { $lte: thirtyDaysFromNow, $gte: today }
      });
    }
  }

  // Stock level patterns
  if (/low stock|below threshold|running low/i.test(query)) {
    conditions.push({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    });
  }

  // Quantity patterns
  const quantityMatch = query.match(/(?:under|below|less than|<)\s*(\d+)/);
  if (quantityMatch) {
    const threshold = parseInt(quantityMatch[1]);
    conditions.push({
      quantity: { $lt: threshold }
    });
  }

  const quantityAboveMatch = query.match(/(?:over|above|more than|greater than|>)\s*(\d+)/);
  if (quantityAboveMatch) {
    const threshold = parseInt(quantityAboveMatch[1]);
    conditions.push({
      quantity: { $gt: threshold }
    });
  }

  // Supplier patterns
  const supplierMatch = query.match(/(?:from|supplier|by)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/);
  if (supplierMatch) {
    const supplierName = supplierMatch[1].trim();
    conditions.push({
      supplier: { $regex: supplierName, $options: 'i' }
    });
  }

  // In stock vs out of stock
  if (/in stock|available/i.test(query)) {
    conditions.push({
      quantity: { $gt: 0 }
    });
  }

  if (/out of stock|no stock|zero stock/i.test(query)) {
    conditions.push({
      quantity: { $eq: 0 }
    });
  }

  // Price patterns
  const priceMatch = query.match(/(?:price|cost)\s*(?:under|below|less than|<)\s*\$?(\d+(?:\.\d{2})?)/);
  if (priceMatch) {
    const price = parseFloat(priceMatch[1]);
    conditions.push({
      price: { $lt: price }
    });
  }

  // General text search if no specific patterns matched
  if (conditions.length === 0) {
    const searchTerms = query
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(term => term.length > 2);

    if (searchTerms.length > 0) {
      const textConditions = searchTerms.map(term => ({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { category: { $regex: term, $options: 'i' } },
          { supplier: { $regex: term, $options: 'i' } }
        ]
      }));
      conditions.push({ $and: textConditions });
    }
  }

  // Combine all conditions
  if (conditions.length === 1) {
    return conditions[0];
  } else if (conditions.length > 1) {
    return { $and: conditions };
  }

  // Fallback: return all medications
  return {};
}