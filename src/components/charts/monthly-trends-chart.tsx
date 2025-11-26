'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyTrendsChartProps {
  data: Array<{
    _id: {
      year: number;
      month: number;
    };
    totalSales: number;
    totalQuantity: number;
    count: number;
  }>;
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  const chartData = data.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    sales: item.totalSales,
    quantity: item.totalQuantity,
    transactions: item.count
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>6-Month Sales Trend</CardTitle>
        <CardDescription>
          Monthly sales performance over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'sales' ? `$${value.toFixed(2)}` : value,
                name === 'sales' ? 'Revenue' : name === 'quantity' ? 'Quantity' : 'Transactions'
              ]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--chart-1))"
              strokeWidth={3}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="quantity"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
