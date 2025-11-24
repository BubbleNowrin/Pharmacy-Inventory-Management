# 🧪 Testing Guide - Pharmacy Inventory System

## 🚀 Quick Start Testing

### 1. **Start the Application**
```bash
cd pharmacy-inventory
npm run dev
```
Visit: `http://localhost:3000`

### 2. **Create Your First Account**
- Click "Register here"
- Fill in details:
  - **Name**: Your Name
  - **Email**: test@pharmacy.com
  - **Role**: Admin (for full access)
  - **Password**: password123

### 3. **Test All Features Step-by-Step**

## 📋 Feature Testing Checklist

### ✅ Authentication & Navigation
- [ ] Register new account
- [ ] Login with credentials
- [ ] Navigate between pages using sidebar
- [ ] Logout functionality
- [ ] Protected routes (try accessing `/inventory` without login)

### ✅ Dashboard
- [ ] View total medications count (starts at 0)
- [ ] Check alerts section (should show "All Good!" initially)
- [ ] Inventory value display
- [ ] Recent activities section

### ✅ Inventory Management

#### Adding Medications
- [ ] Click "Inventory" → "Add Medication"
- [ ] Fill required fields:
  - **Name**: Paracetamol
  - **Category**: Painkiller
  - **Quantity**: 50
  - **Unit**: tablet
  - **Price**: 0.50
  - **Expiry Date**: (set 15 days from today)
  - **Batch Number**: BATCH001
  - **Supplier**: MedCo
  - **Low Stock Threshold**: 10

#### Test Low Stock Alert
- [ ] Add another medication with quantity **below** threshold:
  - **Name**: Aspirin
  - **Quantity**: 5
  - **Low Stock Threshold**: 10
- [ ] Check dashboard - should show low stock alert

#### Test Expiry Alert
- [ ] Add medication with expiry date within 30 days
- [ ] Dashboard should show expiry warning

#### Barcode Scanning
- [ ] Click camera icon when adding medication
- [ ] Allow camera permission
- [ ] Try scanning any barcode/QR code
- [ ] Should auto-fill batch number field

#### Edit/Delete
- [ ] Click edit icon on any medication
- [ ] Modify details and save
- [ ] Try delete functionality (confirm dialog)

#### Search & Filter
- [ ] Use search bar to find medications
- [ ] Test search by name, batch number, supplier
- [ ] Check pagination if you have 10+ items

## 🎯 Test Scenarios

### Scenario 1: Low Stock Management
1. Add 3 medications with different stock levels
2. Set one below threshold
3. Check dashboard alerts
4. Go to inventory and verify badge shows "Low Stock"

### Scenario 2: Expiry Management
1. Add medication expiring in 20 days
2. Add medication expiring in 40 days
3. Add expired medication (past date)
4. Check dashboard shows correct expiry counts

### Scenario 3: Complete Workflow
1. Register as Admin
2. Add 5-10 medications with varied data
3. Test edit functionality
4. Test search/filter
5. Check real-time dashboard updates

## 🛠️ Troubleshooting

### Common Issues:

**1. "Not redirected after login"**
- Clear browser cookies
- Try hard refresh (Ctrl+F5)
- Check browser console for errors

**2. "Camera not working for barcode scan"**
- Grant camera permissions
- Use HTTPS or localhost
- Try different browser

**3. "MongoDB connection error"**
- Ensure MongoDB is running
- Check `.env.local` connection string
- Verify database name

**4. "Token/Auth errors"**
- Clear localStorage
- Re-register/login
- Check JWT_SECRET in `.env.local`

### Debug Steps:
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls
4. Verify localStorage has token and user data

## 📊 Expected Results

After testing, you should have:
- ✅ Working authentication system
- ✅ Functional inventory CRUD operations
- ✅ Real-time alerts and dashboard
- ✅ Barcode scanning capability
- ✅ Professional UI with all features working

## 🎥 Demo Data Suggestions

Create these test medications to see all features:

1. **Paracetamol** - Normal stock, future expiry
2. **Aspirin** - Low stock (quantity: 3, threshold: 10)
3. **Ibuprofen** - Expiring soon (15 days)
4. **Vitamin C** - Expired (past date)
5. **Antibiotic** - Normal stock

This will showcase all alert types and UI states!