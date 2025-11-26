'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  data: Array<{
    _id: string;
    totalSales: number;
    totalQuantity: number;
    count: number;
  }>;
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = data.map(item => ({
    date: new Date(item._id).toLocaleDateString(),
    sales: item.totalSales,
    quantity: item.totalQuantity,
    transactions: item.count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Sales Trend</CardTitle>
        <CardDescription>
          Revenue and transaction volume over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'sales' ? `$${value.toFixed(2)}` : value,
                name === 'sales' ? 'Revenue' : 'Transactions'
              ]}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
