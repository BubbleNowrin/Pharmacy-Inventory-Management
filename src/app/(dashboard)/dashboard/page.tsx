'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingUp, DollarSign, Calendar } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your pharmacy inventory</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : totalMedications}</div>
            <p className="text-xs text-muted-foreground">
              Total items in inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? '...' : alerts.summary.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? '...' : alerts.summary.expiringSoonCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Within next 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(inventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest inventory movements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-sm text-gray-500">Loading activities...</div>
              ) : (
                <>
                  {alerts.lowStock.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name} - Low Stock</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit} remaining (threshold: {item.lowStockThreshold})
                        </p>
                      </div>
                    </div>
                  ))}
                  {alerts.expiringSoon.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name} - Expiring Soon</p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {formatDate(item.expiryDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>
              Important updates that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-sm text-gray-500">Loading alerts...</div>
              ) : (
                <>
                  {alerts.summary.lowStockCount > 0 && (
                    <div className="flex items-center p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Critical Stock Level</p>
                        <p className="text-xs text-red-600">
                          {alerts.summary.lowStockCount} medicines below minimum threshold
                        </p>
                      </div>
                      <Badge variant="destructive">{alerts.summary.lowStockCount}</Badge>
                    </div>
                  )}
                  
                  {alerts.summary.expiringSoonCount > 0 && (
                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-yellow-500 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800">Expiry Alert</p>
                        <p className="text-xs text-yellow-600">
                          {alerts.summary.expiringSoonCount} medicines expiring in 30 days
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {alerts.summary.expiringSoonCount}
                      </Badge>
                    </div>
                  )}

                  {alerts.summary.expiredCount > 0 && (
                    <div className="flex items-center p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">Expired Medications</p>
                        <p className="text-xs text-red-700">
                          {alerts.summary.expiredCount} medicines have expired
                        </p>
                      </div>
                      <Badge variant="destructive">{alerts.summary.expiredCount}</Badge>
                    </div>
                  )}

                  {alerts.summary.lowStockCount === 0 && 
                   alerts.summary.expiringSoonCount === 0 && 
                   alerts.summary.expiredCount === 0 && (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Package className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-800">All Good!</p>
                        <p className="text-xs text-green-600">No urgent alerts at the moment</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}