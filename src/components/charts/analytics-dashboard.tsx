'use client';

import { useState, useEffect } from 'react';
import { SalesChart } from '@/components/charts/sales-chart';
import { TopSellingChart } from '@/components/charts/top-selling-chart';
import { CategoryChart } from '@/components/charts/category-chart';
import { MonthlyTrendsChart } from '@/components/charts/monthly-trends-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  dailySales: any[];
  dailyPurchases: any[];
  topSellingMedications: any[];
  categoryPerformance: any[];
  monthlyTrends: any[];
  stockMovements: any[];
  inventorySummary: {
    totalMedications: number;
    totalQuantity: number;
    totalValue: number;
    lowStockCount: number;
  };
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?days=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center text-gray-500">
        Failed to load analytics data
      </div>
    );
  }

  const totalSales = analyticsData.dailySales.reduce((sum, day) => sum + day.totalSales, 0);
  const totalPurchases = analyticsData.dailyPurchases.reduce((sum, day) => sum + (day.totalCost || day.totalPurchases || 0), 0);
  const averageDailySales = totalSales / (analyticsData.dailySales.length || 1);
  const profitMargin = totalPurchases > 0 ? ((totalSales - totalPurchases) / totalSales * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setSelectedPeriod(days)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === days
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {days === 7 ? 'Last 7 days' : days === 30 ? 'Last 30 days' : 'Last 90 days'}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-contrast-lime border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary/80">Total Revenue</CardTitle>
            <div className="p-1.5 bg-white/50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-primary/70">
              Last {selectedPeriod} days
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-contrast-teal border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary/80">Daily Average</CardTitle>
            <div className="p-1.5 bg-white/50 rounded-lg">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(averageDailySales)}</div>
            <p className="text-xs text-primary/70">
              Per day revenue
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-contrast-pink border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary/80">Profit Margin</CardTitle>
            <div className="p-1.5 bg-white/50 rounded-lg">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-primary/70">
              Estimated profit margin
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-contrast-lavender border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary/80">Inventory Value</CardTitle>
            <div className="p-1.5 bg-white/50 rounded-lg">
              <TrendingDown className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(analyticsData.inventorySummary.totalValue)}
            </div>
            <p className="text-xs text-primary/70">
              Current stock value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart data={analyticsData.dailySales} />
        <TopSellingChart data={analyticsData.topSellingMedications} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CategoryChart data={analyticsData.categoryPerformance} />
        <div className="lg:col-span-2">
          <MonthlyTrendsChart data={analyticsData.monthlyTrends} />
        </div>
      </div>

      {/* Stock Movement Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movements Summary</CardTitle>
          <CardDescription>
            Breakdown of inventory changes in the last {selectedPeriod} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {analyticsData.stockMovements.map((movement, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold">
                  {movement.totalQuantity}
                </div>
                <div className="text-sm text-muted-foreground capitalize">
                  {movement._id}
                </div>
                <Badge variant="secondary" className="mt-1">
                  {movement.count} transactions
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
