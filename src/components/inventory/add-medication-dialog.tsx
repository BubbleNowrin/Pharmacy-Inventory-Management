'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarcodeScanner } from '@/components/barcode/barcode-scanner';
import { Plus, Camera } from 'lucide-react';

interface AddMedicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddMedicationDialog({ isOpen, onClose, onSuccess }: AddMedicationDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'tablet',
    price: '',
    expiryDate: '',
    batchNumber: '',
    supplier: '',
    lowStockThreshold: '10',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);

  const categories = [
    'Painkiller',
    'Antibiotic',
    'Antacid',
    'Vitamin',
    'Supplement',
    'Cold & Flu',
    'Allergy',
    'Diabetes',
    'Blood Pressure',
    'Other',
  ];

  const units = [
    'tablet',
    'capsule',
    'bottle',
    'vial',
    'box',
    'ml',
    'mg',
    'g',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBarcodeScanned = (barcode: string) => {
    // For now, we'll just set the barcode as the batch number
    // In a real app, you might want to fetch medication details from a database
    setFormData(prev => ({ ...prev, batchNumber: barcode }));
    setScannerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
          lowStockThreshold: parseInt(formData.lowStockThreshold),
          expiryDate: new Date(formData.expiryDate),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({
          name: '',
          category: '',
          quantity: '',
          unit: 'tablet',
          price: '',
          expiryDate: '',
          batchNumber: '',
          supplier: '',
          lowStockThreshold: '10',
        });
      } else {
        setError(data.error || 'Failed to add medication');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b bg-gray-50/50">
            <DialogTitle className="flex items-center gap-2 text-xl text-primary">
              <div className="p-2 bg-primary/10 rounded-full">
                <Plus className="h-5 w-5" />
              </div>
              Add New Medication
            </DialogTitle>
            <DialogDescription>
              Enter the details below to add a new medication to your inventory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medicine Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="e.g., Paracetamol"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  required
                  min="0"
                  placeholder="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price per Unit *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                  min="0"
                  placeholder="10.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <div className="flex gap-2">
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                    required
                    placeholder="BATCH123"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setScannerOpen(true)}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  required
                  placeholder="MedCo Pharmaceuticals"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => handleInputChange('lowStockThreshold', e.target.value)}
                min="0"
                placeholder="10"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Medication'}
              </Button>
            </div>
          </form>
          </div>
        </DialogContent>
      </Dialog>

      <BarcodeScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />
    </>
  );
}