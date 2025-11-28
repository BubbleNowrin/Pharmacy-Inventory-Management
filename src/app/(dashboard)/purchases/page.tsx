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
import { TrendingUp, Package, Calendar, AlertCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Medication {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  supplier: string;
  batchNumber: string;
  expiryDate: string;
}

interface Purchase {
  _id: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  supplier: string;
  batchNumber: string;
  expiryDate: string;
  date: string;
  medication: Medication;
}

export default function PurchasesPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [supplier, setSupplier] = useState<string>('');
  const [suppliers, setSuppliers] = useState<Array<{_id: string, name: string}>>([]);
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers?active=true');
      const result = await response.json();
      if (result.success) {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  useEffect(() => {
    fetchMedications();
    fetchPurchases();
    fetchSuppliers();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/medications');
      const data = await response.json();
      setMedications(data.medications || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch medications",
        variant: "destructive",
      });
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchases');
      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch purchases",
        variant: "destructive",
      });
    }
  };

  const generateBatchNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `B${year}${month}${day}${random}`;
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedication || quantity < 1 || unitPrice < 0 || !supplier || !batchNumber || !expiryDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiry <= today) {
      toast({
        title: "Invalid Expiry Date",
        description: "Expiry date must be in the future",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicineId: selectedMedication,
          quantity,
          unitPrice,
          supplier,
          batchNumber,
          expiryDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record purchase');
      }

      const medication = medications.find(m => m._id === selectedMedication);
      
      toast({
        title: "Purchase Recorded",
        description: `Successfully added ${quantity} ${medication?.unit}(s) of ${medication?.name}`,
      });

      // Reset form
      setSelectedMedication('');
      setQuantity(1);
      setUnitPrice(0);
      setSupplier('');
      setBatchNumber('');
      setExpiryDate('');
      
      // Refresh data
      fetchMedications();
      fetchPurchases();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record purchase",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare options for autocomplete
  const medicationOptions = medications.map(med => ({
    value: med._id,
    label: med.name,
    subtitle: `${med.category} • Current: ${med.quantity} ${med.unit}`,
    badge: `$${med.price} • ${med.supplier}`,
    data: med
  }));

  const selectedMed = medications.find(m => m._id === selectedMedication);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">Record incoming stock and manage inventory additions</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Purchase Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Record Purchase
            </CardTitle>
            <CardDescription>
              Add incoming stock to inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePurchase} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Search & Select Medication</Label>
                <Autocomplete
                  options={medicationOptions}
                  value={selectedMedication}
                  onSelect={(value, option) => {
                    setSelectedMedication(value);
                    // Pre-fill supplier if it matches previous supplier
                    if (option.data?.supplier && !supplier) {
                      setSupplier(option.data.supplier);
                    }
                  }}
                  placeholder="Search medications by name, category, or supplier..."
                  searchPlaceholder="Type to search medications..."
                  emptyMessage="No medications found matching your search."
                  className="w-full"
                />
              </div>

              {selectedMed && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Current Stock: <span className="font-medium">{selectedMed.quantity} {selectedMed.unit}</span></div>
                    <div>Current Price: <span className="font-medium">${selectedMed.price}</span></div>
                    <div>Last Batch: <span className="font-medium">{selectedMed.batchNumber}</span></div>
                    <div>Last Supplier: <span className="font-medium">{selectedMed.supplier}</span></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price ($)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                {suppliers.length === 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 border border-orange-200 rounded-md bg-orange-50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-800">No suppliers found</span>
                    </div>
                    <Link href="/suppliers">
                      <Button type="button" variant="outline" size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Suppliers First
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Select value={supplier} onValueChange={setSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((sup) => (
                        <SelectItem key={sup._id} value={sup.name}>
                          {sup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="batchNumber"
                    placeholder="Enter batch number..."
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setBatchNumber(generateBatchNumber())}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {quantity > 0 && unitPrice > 0 && (
                <div className="p-3 bg-primary/10 rounded-md">
                  <div className="text-sm">
                    <div>Total Amount: <span className="font-bold text-lg">${(quantity * unitPrice).toFixed(2)}</span></div>
                    {selectedMed && (
                      <div>New Total Stock: <span className="font-medium">{selectedMed.quantity + quantity} {selectedMed.unit}</span></div>
                    )}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || suppliers.length === 0}>
                {isLoading ? "Recording Purchase..." : "Record Purchase"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>Latest purchase transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {purchases.slice(0, 10).map((purchase) => (
                <div key={purchase._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{purchase.medication?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {purchase.quantity} units • ${purchase.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Supplier: {purchase.supplier}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {new Date(purchase.date).toLocaleDateString()}
                    </div>
                    <Badge variant="outline">
                      {purchase.batchNumber}
                    </Badge>
                  </div>
                </div>
              ))}
              {purchases.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No purchases recorded yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>Complete purchase transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase._id}>
                    <TableCell>
                      {new Date(purchase.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.medication?.name}</div>
                        <div className="text-sm text-muted-foreground">{purchase.medication?.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{purchase.batchNumber}</Badge>
                    </TableCell>
                    <TableCell>{purchase.quantity} {purchase.medication?.unit}</TableCell>
                    <TableCell>${purchase.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>${purchase.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(purchase.expiryDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}