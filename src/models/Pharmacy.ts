import mongoose from 'mongoose';

export interface IPharmacy {
  _id: string;
  name: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  ownerName: string;
  isActive: boolean;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pharmacySchema = new mongoose.Schema<IPharmacy>({
  name: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    trim: true,
    maxlength: [100, 'Pharmacy name cannot exceed 100 characters']
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  zipCode: {
    type: String,
    required: [true, 'Zip code is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'USA'
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    trim: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  subscriptionExpiry: {
    type: Date,
    required: [true, 'Subscription expiry is required'],
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
}, {
  timestamps: true
});

// Create indexes for better performance (unique indexes are already created by schema)
pharmacySchema.index({ isActive: 1 });
pharmacySchema.index({ subscriptionExpiry: 1 });

export default mongoose.models.Pharmacy || mongoose.model<IPharmacy>('Pharmacy', pharmacySchema);