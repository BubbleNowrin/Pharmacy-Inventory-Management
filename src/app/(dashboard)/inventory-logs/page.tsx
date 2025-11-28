'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryLog {
  _id: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'expired' | 'damaged';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitPrice?: number;
  totalAmount?: number;
  reference: string;
  notes?: string;
  batchNumber?: string;
  date: string;
  medication: {
    name: string;
    category: string;
    unit: string;
  };
}

export default function InventoryLogsPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, typeFilter, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/inventory-logs');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch logs');
      }
      
      setLogs(data.logs || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch inventory logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.medication.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === typeFilter);
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(log => new Date(log.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(log => new Date(log.date) <= new Date(endDate));
    }

    setFilteredLogs(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'purchase':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      sale: 'destructive',
      purchase: 'default',
      adjustment: 'secondary',
      expired: 'destructive',
      damaged: 'destructive',
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'secondary'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Logs</h1>
          <p className="text-muted-foreground">Complete history of all stock movements and transactions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter logs by type, date range, or search terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search medications, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Movement Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="purchase">Purchases</SelectItem>
                  <SelectItem value="adjustment">Adjustments</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-contrast-lime border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/50 rounded-lg">
                <ArrowDown className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary/70">Total Sales</p>
                <p className="text-2xl font-bold text-primary">
                  {filteredLogs.filter(log => log.type === 'sale').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-contrast-teal border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/50 rounded-lg">
                <ArrowUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary/70">Total Purchases</p>
                <p className="text-2xl font-bold text-primary">
                  {filteredLogs.filter(log => log.type === 'purchase').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-contrast-pink border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/50 rounded-lg">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary/70">Total Movements</p>
                <p className="text-2xl font-bold text-primary">{filteredLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-contrast-lavender border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-sm text-primary/70">Total Value</p>
                <p className="text-2xl font-bold text-primary">
                  ${filteredLogs.reduce((sum, log) => sum + (log.totalAmount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Movement History</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} total movements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading logs...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Previous Qty</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>New Qty</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <div>
                          <div>{new Date(log.date).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.date).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.type)}
                          {getTypeBadge(log.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.medication.name}</div>
                          <div className="text-sm text-muted-foreground">{log.medication.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>{log.previousQuantity} {log.medication.unit}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${log.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {log.quantity >= 0 ? '+' : ''}{log.quantity} {log.medication.unit}
                        </span>
                      </TableCell>
                      <TableCell>{log.newQuantity} {log.medication.unit}</TableCell>
                      <TableCell>
                        {log.totalAmount ? `$${log.totalAmount.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {log.batchNumber ? (
                          <Badge variant="outline">{log.batchNumber}</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate text-sm text-muted-foreground">
                          {log.notes || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredLogs.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No inventory movements found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}