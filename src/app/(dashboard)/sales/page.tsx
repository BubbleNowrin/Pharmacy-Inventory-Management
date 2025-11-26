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
import { ShoppingCart, Search, AlertCircle } from 'lucide-react';
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

interface Sale {
  _id: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName?: string;
  date: string;
  medication: Medication;
}

export default function SalesPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedications();
    fetchSales();
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

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      const data = await response.json();
      setSales(data.sales || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sales",
        variant: "destructive",
      });
    }
  };

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedication || quantity < 1) {
      toast({
        title: "Error",
        description: "Please select a medication and valid quantity",
        variant: "destructive",
      });
      return;
    }

    const medication = medications.find(m => m._id === selectedMedication);
    if (!medication) return;

    if (quantity > medication.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${medication.quantity} ${medication.unit}(s) available`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicineId: selectedMedication,
          quantity,
          unitPrice: medication.price,
          customerName: customerName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record sale');
      }

      toast({
        title: "Sale Recorded",
        description: `Successfully sold ${quantity} ${medication.unit}(s) of ${medication.name}`,
      });

      // Reset form
      setSelectedMedication('');
      setQuantity(1);
      setCustomerName('');
      
      // Refresh data
      fetchMedications();
      fetchSales();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record sale",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare options for autocomplete
  const medicationOptions = filteredMedications.map(med => ({
    value: med._id,
    label: med.name,
    subtitle: `${med.category} • ${med.supplier}`,
    badge: `${med.quantity} ${med.unit} • $${med.price}`,
    data: med
  }));

  const selectedMed = medications.find(m => m._id === selectedMedication);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Record medication sales and manage stock deductions</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Record Sale
            </CardTitle>
            <CardDescription>
              Select medication and quantity to record a sale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSale} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Search & Select Medication</Label>
                <Autocomplete
                  options={medicationOptions}
                  value={selectedMedication}
                  onSelect={(value, option) => {
                    setSelectedMedication(value);
                    setSearchTerm('');
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
                    <div>Available: <span className="font-medium">{selectedMed.quantity} {selectedMed.unit}</span></div>
                    <div>Price: <span className="font-medium">${selectedMed.price}</span></div>
                    <div>Batch: <span className="font-medium">{selectedMed.batchNumber}</span></div>
                    <div>Supplier: <span className="font-medium">{selectedMed.supplier}</span></div>
                  </div>
                  {selectedMed.quantity < selectedMed.lowStockThreshold && (
                    <div className="flex items-center gap-2 mt-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Low stock warning</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedMed?.quantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name (Optional)</Label>
                <Input
                  id="customer"
                  placeholder="Enter customer name..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {selectedMed && (
                <div className="p-3 bg-primary/10 rounded-md">
                  <div className="text-sm">
                    <div>Total Amount: <span className="font-bold text-lg">${(quantity * selectedMed.price).toFixed(2)}</span></div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Recording Sale..." : "Record Sale"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest sales transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sales.slice(0, 10).map((sale) => (
                <div key={sale._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{sale.medication?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {sale.quantity} units • ${sale.totalAmount.toFixed(2)}
                    </div>
                    {sale.customerName && (
                      <div className="text-sm text-muted-foreground">
                        Customer: {sale.customerName}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {new Date(sale.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(sale.date).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No sales recorded yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>Complete sales transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale._id}>
                    <TableCell>
                      {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sale.medication?.name}</div>
                        <div className="text-sm text-muted-foreground">{sale.medication?.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>{sale.customerName || '-'}</TableCell>
                    <TableCell>{sale.quantity} {sale.medication?.unit}</TableCell>
                    <TableCell>${sale.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>${sale.totalAmount.toFixed(2)}</TableCell>
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