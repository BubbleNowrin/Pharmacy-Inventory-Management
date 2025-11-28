'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';

interface Forecast {
  medicationId: string;
  medicationName: string;
  currentStock: number;
  predictedDemand: number;
  recommendedReorderPoint: number;
  recommendedOrderQuantity: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
  daysUntilStockout?: number;
  category: string;
  supplier: string;
}

interface AIInsight {
  forecasts: Forecast[];
  insights: string[];
  metadata: {
    timeframe: string;
    medicationsAnalyzed: number;
    salesDataPoints: number;
    analysisDate: string;
  };
}

export function AIForecastDashboard() {
  const [aiData, setAiData] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAIForecasts();
  }, [timeframe]);

  const fetchAIForecasts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/ai/forecast?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI forecasts');
      }
      
      const data = await response.json();
      setAiData(data);
    } catch (error) {
      console.error('Error fetching AI forecasts:', error);
      setError('Failed to load AI forecasts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Forecasting</h2>
            <p className="text-gray-600">Generating intelligent recommendations...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Forecasting</h2>
            <p className="text-gray-600">Intelligent demand forecasting and recommendations</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Service Unavailable</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchAIForecasts}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!aiData) {
    return null;
  }

  const highRiskItems = aiData.forecasts.filter(f => f.riskLevel === 'high');
  const mediumRiskItems = aiData.forecasts.filter(f => f.riskLevel === 'medium');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Forecasting</h2>
            <p className="text-gray-600">Intelligent demand forecasting and recommendations</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(tf)}
            >
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        <Card className="bg-contrast-pink border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary/80">High Risk Items</CardTitle>
            <div className="p-1.5 bg-white/50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{highRiskItems.length}</div>
            <p className="text-xs text-primary/70">Immediate attention needed</p>
          </CardContent>
        </Card>

        <Card className="bg-contrast-lavender border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary/80">Medium Risk Items</CardTitle>
            <div className="p-1.5 bg-white/50 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{mediumRiskItems.length}</div>
            <p className="text-xs text-primary/70">Monitor closely</p>
          </CardContent>
        </Card>

        <Card className="bg-contrast-teal border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary/80">AI Insights</CardTitle>
            <div className="p-1.5 bg-white/50 rounded-lg">
              <Brain className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{aiData.insights.length}</div>
            <p className="text-xs text-primary/70">Actionable recommendations</p>
          </CardContent>
        </Card>

        <Card className="bg-contrast-lime border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary/80">Analysis Date</CardTitle>
            <div className="p-1.5 bg-white/50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-primary">
              {new Date(aiData.metadata.analysisDate).toLocaleDateString()}
            </div>
            <p className="text-xs text-primary/70">
              {aiData.metadata.medicationsAnalyzed} medications analyzed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Generated Insights
          </CardTitle>
          <CardDescription>
            Key recommendations based on sales patterns and inventory analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiData.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-contrast-teal/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast Results */}
      <Card>
        <CardHeader>
          <CardTitle>Demand Forecasts & Recommendations</CardTitle>
          <CardDescription>
            AI-powered predictions for the next {timeframe}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiData.forecasts.map((forecast, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{forecast.medicationName}</h3>
                    <p className="text-sm text-gray-600">{forecast.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRiskIcon(forecast.riskLevel)}
                    <Badge variant={getRiskBadgeVariant(forecast.riskLevel)}>
                      {forecast.riskLevel} risk
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Current Stock</p>
                    <p className="font-semibold">{forecast.currentStock} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Predicted Demand</p>
                    <p className="font-semibold">{forecast.predictedDemand} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Reorder Point</p>
                    <p className="font-semibold">{forecast.recommendedReorderPoint} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Order Quantity</p>
                    <p className="font-semibold">{forecast.recommendedOrderQuantity} units</p>
                  </div>
                </div>

                {forecast.daysUntilStockout && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <AlertTriangle className="h-4 w-4 inline mr-2" />
                      Estimated stockout in {forecast.daysUntilStockout} days
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium mb-1">AI Reasoning:</h4>
                  <p className="text-sm text-gray-700">{forecast.reasoning}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
