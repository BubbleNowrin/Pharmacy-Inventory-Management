'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, TrendingUp, DollarSign, Calendar, BarChart3, Brain, Activity, ArrowRight, Pill, Users } from 'lucide-react';
import { AnalyticsDashboard } from '@/components/charts/analytics-dashboard';
import { AIForecastDashboard } from '@/components/ai/ai-forecast-dashboard';
import { SmartRecommendations } from '@/components/ai/smart-recommendations';
import { cn } from '@/lib/utils';

interface AlertData {
  lowStock: any[];
  expiringSoon: any[];
  expired: any[];
  summary: {
    lowStockCount: number;
    expiringSoonCount: number;
    expiredCount: number;
  };
}

type DashboardMode = 'overview' | 'analytics' | 'ai';

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<AlertData>({
    lowStock: [],
    expiringSoon: [],
    expired: [],
    summary: {
      lowStockCount: 0,
      expiringSoonCount: 0,
      expiredCount: 0,
    }
  });
  const [totalMedications, setTotalMedications] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState<DashboardMode>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch alerts
      const alertsResponse = await fetch('/api/medications/alerts');
      
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
      }

      // Fetch total medications count and calculate inventory value
      const medicationsResponse = await fetch('/api/medications?limit=10000');
      
      if (medicationsResponse.ok) {
        const medicationsData = await medicationsResponse.json();
        setTotalMedications(medicationsData.pagination.total);
        
        // Calculate inventory value from all medications
        const value = medicationsData.medications.reduce((total: number, med: any) => {
          return total + (med.quantity * (med.price || 0));
        }, 0);
        setInventoryValue(value);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getModeConfig = (mode: DashboardMode) => {
    switch (mode) {
      case 'overview':
        return { icon: Package, label: 'Overview' };
      case 'analytics':
        return { icon: BarChart3, label: 'Analytics' };
      case 'ai':
        return { icon: Brain, label: 'AI Insights' };
      default:
        return { icon: Package, label: 'Overview' };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {currentMode === 'overview' && 'Real-time overview of your pharmacy inventory'}
            {currentMode === 'analytics' && 'Advanced analytics and business intelligence'}
            {currentMode === 'ai' && 'AI-powered insights and forecasting'}
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border shadow-sm">
          {(['overview', 'analytics', 'ai'] as const).map((mode) => {
            const config = getModeConfig(mode);
            const IconComponent = config.icon;
            const isActive = currentMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setCurrentMode(mode)}
                className={cn(
                  "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {currentMode === 'overview' && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-md bg-contrast-lime hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-primary/80">Total Medicines</p>
                  <div className="p-2 bg-white/50 rounded-lg">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold text-primary">{loading ? '...' : totalMedications}</div>
                  <p className="text-xs text-primary/70 mt-1">
                    <span className="text-green-700 font-medium">↑ 12%</span> from last month
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-contrast-pink hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-primary/80">Low Stock Items</p>
                  <div className="p-2 bg-white/50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold text-primary">
                    {loading ? '...' : alerts.summary.lowStockCount}
                  </div>
                  <p className="text-xs text-primary/70 mt-1">
                    Requires immediate attention
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-contrast-lavender hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-primary/80">Expiring Soon</p>
                  <div className="p-2 bg-white/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold text-primary">
                    {loading ? '...' : alerts.summary.expiringSoonCount}
                  </div>
                  <p className="text-xs text-primary/70 mt-1">
                    Within next 30 days
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-contrast-teal hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-primary/80">Inventory Value</p>
                  <div className="p-2 bg-white/50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold text-primary">
                    {loading ? '...' : formatCurrency(inventoryValue)}
                  </div>
                  <p className="text-xs text-primary/70 mt-1">
                    Current stock value
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Activities */}
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-white border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">Recent Activities</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Latest inventory movements and alerts
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5">
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {loading ? (
                      <div className="p-8 text-center text-gray-500">Loading activities...</div>
                    ) : (
                      <>
                        {alerts.lowStock.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-4 flex-shrink-0">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">Low Stock Alert</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {item.quantity} {item.unit} left
                              </span>
                            </div>
                          </div>
                        ))}
                        {alerts.expiringSoon.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-4 flex-shrink-0">
                              <Calendar className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">Expiring Soon</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {formatDate(item.expiryDate)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {alerts.lowStock.length === 0 && alerts.expiringSoon.length === 0 && (
                          <div className="p-8 text-center text-gray-500">
                            No recent alerts or activities.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Grid */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => window.location.href = '/inventory'}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-border hover:shadow-md hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <div className="h-12 w-12 bg-contrast-lime/40 rounded-full flex items-center justify-center mb-3 group-hover:bg-contrast-lime/60 transition-colors">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">Add Medicine</span>
                  </button>
                  
                  <button 
                    onClick={() => window.location.href = '/sales'}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-border hover:shadow-md hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <div className="h-12 w-12 bg-contrast-teal/40 rounded-full flex items-center justify-center mb-3 group-hover:bg-contrast-teal/60 transition-colors">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">Record Sale</span>
                  </button>
                  
                  <button 
                    onClick={() => window.location.href = '/purchases'}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-border hover:shadow-md hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <div className="h-12 w-12 bg-contrast-lavender/40 rounded-full flex items-center justify-center mb-3 group-hover:bg-contrast-lavender/60 transition-colors">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">Add Purchase</span>
                  </button>
                  
                  <button 
                    onClick={() => window.location.href = '/suppliers'}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-border hover:shadow-md hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <div className="h-12 w-12 bg-contrast-pink/40 rounded-full flex items-center justify-center mb-3 group-hover:bg-contrast-pink/60 transition-colors">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">Suppliers</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-8">
              {/* Smart Recommendations */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-1 h-full">
                <SmartRecommendations />
              </div>
            </div>
          </div>
        </>
      )}

      {currentMode === 'analytics' && (
        <AnalyticsDashboard />
      )}

      {currentMode === 'ai' && (
        <AIForecastDashboard />
      )}
    </div>
  );
}
