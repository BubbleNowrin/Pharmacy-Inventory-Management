# 🚀 QUICK TEST INSTRUCTIONS

## Method 1: Test Page (Easiest)

1. **Start the server:**
   ```bash
   cd pharmacy-inventory
   npm run dev
   ```

2. **Go to test page:**
   ```
   http://localhost:3000/test-login
   ```

3. **Click "Quick Test Login"** - This will:
   - Create a test account automatically
   - Log you in
   - Redirect to dashboard

## Method 2: Manual Testing

1. **Go to:** `http://localhost:3000`
2. **Register manually:**
   - Name: Test User
   - Email: test@test.com  
   - Password: test123
   - Role: Admin

## Method 3: Direct Access

If redirect still fails, try accessing directly:
```
http://localhost:3000/dashboard
```

## Debugging Steps

### Check Browser Console:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors

### Check Application Storage:
1. DevTools → Application tab
2. Check **Local Storage** for token/user
3. Check **Cookies** for token

### If Still Not Working:

1. **Clear browser data:**
   - Cookies
   - Local Storage  
   - Cache

2. **Try incognito/private mode**

3. **Check MongoDB:**
   - Ensure MongoDB is running
   - Check connection string in `.env.local`

## Expected Flow:

1. ✅ Register/Login succeeds
2. ✅ Token stored in localStorage + cookies
3. ✅ Redirect to `/dashboard`
4. ✅ Dashboard loads with sidebar navigation
5. ✅ Can click "Inventory" to see medication management

## Test Features Once Logged In:

- 📊 **Dashboard**: View stats and alerts
- 📦 **Inventory**: Add/edit medications  
- 📷 **Barcode Scan**: Camera scanning (needs permission)
- 🔍 **Search**: Find medications
- ⚠️ **Alerts**: Low stock and expiry warnings

---
**If none of these work, let me know what error messages you see!**