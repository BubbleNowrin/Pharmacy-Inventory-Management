# Pharmacy Inventory Management System

A modern, production-style pharmacy inventory and stock optimization web application built with Next.js, MongoDB, and AI integration.

## Features Completed ✅

### Day 1 - Project Setup + Authentication + Basic UI
- ✅ Next.js with TypeScript, TailwindCSS, and ShadCN UI
- ✅ MongoDB connection and models
- ✅ JWT-based authentication system
- ✅ Protected routes with middleware
- ✅ Professional dashboard layout with sidebar navigation

### Day 2 - Inventory Module
- ✅ Complete CRUD operations for medications
- ✅ Advanced search and filtering
- ✅ Barcode/QR code scanning using camera
- ✅ Low stock and expiry date alerts
- ✅ Real-time dashboard with inventory statistics
- ✅ Professional table UI with status badges

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- A modern web browser with camera support (for barcode scanning)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd pharmacy-inventory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Update `.env.local` with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/pharmacy-inventory
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start MongoDB:**
   Make sure your MongoDB instance is running

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Test the Application

### 1. **Register/Login**
   - Go to `http://localhost:3000`
   - You'll be redirected to `/login`
   - Click "Register here" to create a new account
   - Fill in your details and choose a role (Admin/Pharmacist/Cashier)
   - After registration, you'll be automatically logged in

### 2. **Dashboard**
   - After login, you'll see the main dashboard
   - View inventory statistics, alerts, and recent activities
   - All data is real-time and updates based on your inventory

### 3. **Inventory Management**
   - Click "Inventory" in the sidebar
   - **Add Medication**: Click the "Add Medication" button
     - Fill in all details (name, category, quantity, price, etc.)
     - Use the camera icon to scan barcodes (requires camera permission)
     - Set low stock thresholds
   - **Edit/Delete**: Click the edit icon next to any medication
   - **Search**: Use the search bar to find medications by name, batch, or supplier

### 4. **Features to Test**
   - **Barcode Scanning**: Click the camera icon when adding medications
   - **Low Stock Alerts**: Add medications with quantity below threshold
   - **Expiry Alerts**: Add medications with expiry dates within 30 days
   - **Search & Filter**: Test the search functionality
   - **Real-time Updates**: See how dashboard updates when you add/edit medications

## Database Schema

### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'pharmacist' | 'cashier'
}
```

### Medications
```javascript
{
  name: String,
  category: String,
  quantity: Number,
  unit: String,
  price: Number,
  expiryDate: Date,
  batchNumber: String,
  supplier: String,
  lowStockThreshold: Number
}
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: TailwindCSS, ShadCN UI components
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens with middleware protection
- **Barcode Scanning**: ZXing library with camera integration
- **Icons**: Lucide React

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/medications` - Get medications with pagination/search
- `POST /api/medications` - Add new medication
- `PUT /api/medications/[id]` - Update medication
- `DELETE /api/medications/[id]` - Delete medication
- `GET /api/medications/alerts` - Get low stock and expiry alerts

## Next Steps (Coming Soon)

- **Day 3**: Sales & Purchases modules with stock movement
- **Day 4**: AI integration with Groq for forecasting
- **Day 5**: Supplier management and final polish

---

**Note**: This is a development version. Make sure to change JWT secrets and secure the application before production use.