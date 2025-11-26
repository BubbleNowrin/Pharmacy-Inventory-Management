import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

interface MedicationData {
  name: string;
  category: string;
  quantity: number;
  lowStockThreshold: number;
  averageMonthlySales?: number;
  lastMonthSales?: number;
  seasonalTrend?: 'increasing' | 'decreasing' | 'stable';
}

interface ForecastResult {
  medicationId: string;
  medicationName: string;
  currentStock: number;
  predictedDemand: number;
  recommendedReorderPoint: number;
  recommendedOrderQuantity: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
  daysUntilStockout?: number;
}

export async function generateDemandForecast(
  medicationData: MedicationData[],
  salesHistory: any[],
  timeframe: 'week' | 'month' | 'quarter' = 'month'
): Promise<ForecastResult[]> {
  try {
    const prompt = `
You are an AI pharmacy inventory analyst. Analyze the following medication data and sales history to provide intelligent demand forecasting and reorder recommendations.

Medication Data:
${medicationData.map(med => `
- ${med.name} (${med.category})
  Current Stock: ${med.quantity}
  Low Stock Threshold: ${med.lowStockThreshold}
  Average Monthly Sales: ${med.averageMonthlySales || 'N/A'}
  Last Month Sales: ${med.lastMonthSales || 'N/A'}
  Trend: ${med.seasonalTrend || 'unknown'}
`).join('')}

Sales History Summary:
${salesHistory.slice(0, 10).map(sale => `
- Date: ${sale.date}, Medicine: ${sale.medicineName}, Quantity: ${sale.quantity}
`).join('')}

For each medication, provide a JSON response with the following structure:
{
  "forecasts": [
    {
      "medicationName": "string",
      "currentStock": number,
      "predictedDemand": number,
      "recommendedReorderPoint": number,
      "recommendedOrderQuantity": number,
      "riskLevel": "low|medium|high",
      "reasoning": "detailed explanation of the recommendation",
      "daysUntilStockout": number (optional)
    }
  ]
}

Consider factors like:
1. Historical sales patterns
2. Seasonal trends
3. Current stock levels vs. low stock thresholds
4. Lead times for reordering
5. Storage costs vs. stockout costs
6. Category-specific demand patterns

Provide practical, actionable recommendations for a pharmacy inventory manager.
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 2048
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI service');
    }

    // Parse AI response
    const aiResult = JSON.parse(response);
    return aiResult.forecasts || [];

  } catch (error) {
    console.error('Error generating demand forecast:', error);
    
    // Fallback logic if AI service fails
    return medicationData.map(med => ({
      medicationId: '',
      medicationName: med.name,
      currentStock: med.quantity,
      predictedDemand: Math.max(med.averageMonthlySales || med.lowStockThreshold * 2, 10),
      recommendedReorderPoint: Math.max(med.lowStockThreshold * 1.5, 5),
      recommendedOrderQuantity: Math.max(med.lowStockThreshold * 3, 20),
      riskLevel: med.quantity <= med.lowStockThreshold ? 'high' : med.quantity <= med.lowStockThreshold * 2 ? 'medium' : 'low',
      reasoning: 'Fallback recommendation based on historical patterns and safety stock levels.',
      daysUntilStockout: med.averageMonthlySales ? Math.floor(med.quantity / (med.averageMonthlySales / 30)) : undefined
    })) as ForecastResult[];
  }
}

export async function generateInventoryInsights(
  inventoryData: any[],
  salesData: any[],
  purchaseData: any[]
): Promise<string[]> {
  try {
    const prompt = `
As a pharmacy inventory AI analyst, provide 3-5 key actionable insights based on this data:

Inventory Summary:
- Total medications: ${inventoryData.length}
- Low stock items: ${inventoryData.filter(item => item.quantity <= item.lowStockThreshold).length}
- Total inventory value: $${inventoryData.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}

Recent Sales Patterns:
${salesData.slice(0, 5).map(sale => `- ${sale.medicineName}: ${sale.quantity} units sold`).join('\n')}

Purchase History:
${purchaseData.slice(0, 3).map(purchase => `- ${purchase.medicineName}: ${purchase.quantity} units purchased from ${purchase.supplier}`).join('\n')}

Provide insights in this format:
{
  "insights": [
    "Insight 1: Brief, actionable recommendation",
    "Insight 2: Brief, actionable recommendation",
    ...
  ]
}

Focus on:
1. Stock optimization opportunities
2. Cost reduction strategies
3. Risk mitigation
4. Seasonal preparation
5. Supplier optimization
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.4,
      max_tokens: 1024
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return ['AI insights temporarily unavailable'];
    }

    const result = JSON.parse(response);
    return result.insights || ['AI insights temporarily unavailable'];

  } catch (error) {
    console.error('Error generating insights:', error);
    return [
      'Monitor low stock items closely to prevent stockouts',
      'Consider bulk purchasing for high-volume medications to reduce costs',
      'Review slow-moving inventory to optimize storage costs',
      'Analyze seasonal patterns to improve demand planning'
    ];
  }
}

export async function generateSmartRecommendations(
  medicationName: string,
  currentStock: number,
  recentSales: any[],
  category: string
): Promise<{
  action: 'reorder' | 'reduce' | 'maintain';
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  quantity?: number;
}> {
  try {
    const prompt = `
Analyze this specific medication and provide a smart recommendation:

Medication: ${medicationName}
Category: ${category}
Current Stock: ${currentStock}
Recent Sales: ${recentSales.map(sale => `${sale.quantity} units on ${sale.date}`).join(', ')}

Provide a JSON response:
{
  "action": "reorder|reduce|maintain",
  "priority": "high|medium|low",
  "recommendation": "specific actionable advice",
  "quantity": number (if action is reorder)
}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      max_tokens: 512
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No AI response');
    }

    // Try to extract JSON from markdown response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if no JSON found
    return {
      medications: [],
      analysis: "AI service temporarily unavailable",
      recommendations: []
    };

  } catch (error) {
    console.error('Error generating smart recommendation:', error);
    
    // Simple fallback logic
    const avgDailySales = recentSales.reduce((sum, sale) => sum + sale.quantity, 0) / Math.max(recentSales.length, 1);
    const daysOfStock = currentStock / Math.max(avgDailySales, 0.1);
    
    if (daysOfStock < 7) {
      return {
        action: 'reorder',
        priority: 'high',
        recommendation: `Critical: Only ${daysOfStock.toFixed(1)} days of stock remaining. Immediate reorder required.`,
        quantity: Math.ceil(avgDailySales * 30)
      };
    } else if (daysOfStock < 14) {
      return {
        action: 'reorder',
        priority: 'medium',
        recommendation: `Moderate: ${daysOfStock.toFixed(1)} days of stock remaining. Plan reorder soon.`,
        quantity: Math.ceil(avgDailySales * 21)
      };
    } else {
      return {
        action: 'maintain',
        priority: 'low',
        recommendation: `Good: ${daysOfStock.toFixed(1)} days of stock remaining. Current levels are adequate.`
      };
    }
  }
}
