import mongoose from 'mongoose';

export interface IInventoryLog {
  _id: string;
  medicineId: mongoose.Types.ObjectId;
  type: 'sale' | 'purchase' | 'adjustment' | 'expired' | 'damaged';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitPrice?: number;
  totalAmount?: number;
  reference: string; // Reference to sale ID, purchase ID, etc.
  notes?: string;
  batchNumber?: string;
  performedBy?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryLogSchema = new mongoose.Schema<IInventoryLog>({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: [true, 'Medicine ID is required'],
  },
  type: {
    type: String,
    enum: ['sale', 'purchase', 'adjustment', 'expired', 'damaged'],
    required: [true, 'Movement type is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
  },
  previousQuantity: {
    type: Number,
    required: [true, 'Previous quantity is required'],
  },
  newQuantity: {
    type: Number,
    required: [true, 'New quantity is required'],
  },
  unitPrice: {
    type: Number,
    min: 0,
  },
  totalAmount: {
    type: Number,
    min: 0,
  },
  reference: {
    type: String,
    required: [true, 'Reference is required'],
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  batchNumber: {
    type: String,
    trim: true,
  },
  performedBy: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for better query performance
inventoryLogSchema.index({ medicineId: 1, date: -1 });
inventoryLogSchema.index({ type: 1, date: -1 });

export default mongoose.models.InventoryLog || mongoose.model<IInventoryLog>('InventoryLog', inventoryLogSchema);