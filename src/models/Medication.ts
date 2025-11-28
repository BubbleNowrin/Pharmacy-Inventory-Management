import mongoose from 'mongoose';

export interface IMedication {
  _id: string;
  pharmacyId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  expiryDate: Date;
  batchNumber: string;
  supplier: string;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const medicationSchema = new mongoose.Schema<IMedication>({
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: [true, 'Pharmacy ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0,
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['tablet', 'capsule', 'bottle', 'vial', 'box', 'ml', 'mg', 'g'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true,
  },
  supplier: {
    type: String,
    required: [true, 'Supplier is required'],
    trim: true,
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Medication || mongoose.model<IMedication>('Medication', medicationSchema);