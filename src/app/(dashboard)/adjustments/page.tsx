'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Search, MinusCircle, Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Medication {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  lowStockThreshold: number;
  supplier: string;
  batchNumber: string;
  expiryDate: string;
}

interface Adjustment {
  _id: string;
  medicineId: string;
  type: 'adjustment' | 'expired' | 'damaged';
  quantity: number;
  previousQuantity?: number;
  newQuantity?: number;
  reason: string;
  notes?: string;
  date: string;
  medication: {
    name: string;
    category: string;
    unit: string;
  };
}

export default function AdjustmentsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'adjustment' | 'expired' | 'damaged'>('adjustment');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMedications();
    fetchAdjustments();
  }, [pagination.page]);

  useEffect(() => {
    fetchAdjustments();
  }, [filterType]);

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/medications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setMedications(data.medications || []);
    } catch (error) {
      console.error('Failed to fetch medications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch medications',
        variant: 'destructive',
      });
    }
  };

  const fetchAdjustments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/adjustments?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      
      setAdjustments(data.adjustments || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Failed to fetch adjustments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch adjustments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedication || !reason.trim() || quantity <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          medicineId: selectedMedication,
          type: adjustmentType,
          quantity,
          reason,
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Stock adjustment recorded successfully',
          variant: 'success',
        });
        
        // Reset form
        setSelectedMedication('');
        setQuantity(1);
        setReason('');
        setNotes('');
        
        // Refresh data
        fetchAdjustments();
        fetchMedications();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to record adjustment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to record adjustment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record adjustment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAdjustmentTypeColor = (type: string) => {
    switch (type) {
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'damaged':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  const getAdjustmentTypeIcon = (type: string) => {
    switch (type) {
      case 'expired':
      case 'damaged':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <MinusCircle className="h-3 w-3" />;
    }
  };

  // Prepare options for autocomplete
  const medicationOptions = medications.map(med => ({
    value: med._id,
    label: med.name,
    subtitle: `${med.category} • ${med.supplier}`,
    badge: `${med.quantity} ${med.unit} • $${med.price}`,
    data: med
  }));

  // Filter adjustments by type
  const filteredAdjustments = adjustments.filter(adj => 
    filterType === 'all' || adj.type === filterType
  );

  const selectedMed = medications.find(med => med._id === selectedMedication);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Adjustments</h1>
          <p className="text-muted-foreground mt-1">
            Record stock adjustments, expired items, and damaged goods
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="adjustment">Adjustments</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* New Adjustment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Record New Adjustment
          </CardTitle>
          <CardDescription>
            Record stock adjustments for inventory corrections, expired items, or damaged goods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitAdjustment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Medication *</Label>
                <Select value={selectedMedication} onValueChange={setSelectedMedication}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medication..." />
                  </SelectTrigger>
                  <SelectContent>
                    {medications.map(med => (
                      <SelectItem key={med._id} value={med._id}>
                        {med.name} ({med.quantity} {med.unit}) - {med.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedMed && (
                  <div className="text-sm text-muted-foreground">
                    Current stock: {selectedMed.quantity} {selectedMed.unit}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Adjustment Type *</Label>
                <Select value={adjustmentType} onValueChange={(value: 'adjustment' | 'expired' | 'damaged') => setAdjustmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                    <SelectItem value="expired">Expired Items</SelectItem>
                    <SelectItem value="damaged">Damaged Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity to Remove *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedMed?.quantity || 999999}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for adjustment"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional notes..."
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !selectedMedication || !reason.trim()}
              className="w-full md:w-auto"
            >
              {isLoading ? 'Recording...' : 'Record Adjustment'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Adjustments History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Adjustment History
          </CardTitle>
          <CardDescription>
            View recent stock adjustments and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && adjustments.length === 0 ? (
            <div className="text-center py-8">Loading adjustments...</div>
          ) : adjustments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No adjustments found.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdjustments.map((adjustment) => (
                      <TableRow key={adjustment._id}>
                        <TableCell>
                          {new Date(adjustment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{adjustment.medication?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {adjustment.medication?.category}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getAdjustmentTypeColor(adjustment.type)} flex items-center gap-1`}>
                            {getAdjustmentTypeIcon(adjustment.type)}
                            {adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-red-600 font-medium">
                            -{adjustment.quantity} {adjustment.medication?.unit}
                          </span>
                        </TableCell>
                        <TableCell>{adjustment.reason}</TableCell>
                        <TableCell>
                          {adjustment.notes && (
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {adjustment.notes}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} adjustments
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
