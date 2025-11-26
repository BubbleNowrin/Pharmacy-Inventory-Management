'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopSellingChartProps {
  data: Array<{
    _id: string;
    totalQuantity: number;
    totalRevenue: number;
    salesCount: number;
    medication: {
      name: string;
      category: string;
    };
  }>;
}

export function TopSellingChart({ data }: TopSellingChartProps) {
  const chartData = data.map(item => ({
    name: item.medication.name.length > 15 
      ? item.medication.name.substring(0, 15) + '...' 
      : item.medication.name,
    quantity: item.totalQuantity,
    revenue: item.totalRevenue
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Medications</CardTitle>
        <CardDescription>
          Best performing medications by quantity sold
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${value.toFixed(2)}` : value,
                name === 'revenue' ? 'Revenue' : 'Quantity Sold'
              ]}
            />
            <Bar
              dataKey="quantity"
              fill="hsl(var(--chart-2))"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
