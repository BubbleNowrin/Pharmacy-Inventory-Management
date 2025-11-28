import mongoose from 'mongoose';

export interface IPurchase {
  _id: string;
  pharmacyId: mongoose.Types.ObjectId;
  medicineId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  supplier: string;
  batchNumber: string;
  expiryDate: Date;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema = new mongoose.Schema<IPurchase>({
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: [true, 'Pharmacy ID is required'],
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: [true, 'Medicine ID is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0,
  },
  supplier: {
    type: String,
    required: [true, 'Supplier is required'],
    trim: true,
  },
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', purchaseSchema);