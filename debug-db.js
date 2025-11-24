const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pharmacy-inventory');

// Define the medication schema
const medicationSchema = new mongoose.Schema({
  name: String,
  category: String,
  quantity: Number,
  unit: String,
  price: Number,
  expiryDate: Date,
  batchNumber: String,
  supplier: String,
  lowStockThreshold: Number,
}, {
  timestamps: true,
});

const Medication = mongoose.model('Medication', medicationSchema);

async function debugDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Count total medications
    const totalCount = await Medication.countDocuments();
    console.log(`Total medications in database: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('❌ Database is empty! The data was not inserted properly.');
      return;
    }
    
    // Get all medications to see their expiry dates
    const allMeds = await Medication.find().select('name expiryDate quantity lowStockThreshold');
    console.log('\n📋 All medications in database:');
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    allMeds.forEach(med => {
      const isExpiringSoon = med.expiryDate >= today && med.expiryDate <= thirtyDaysFromNow;
      const isLowStock = med.quantity <= med.lowStockThreshold;
      
      console.log(`${med.name}:`);
      console.log(`  Expiry: ${med.expiryDate.toISOString().split('T')[0]} ${isExpiringSoon ? '🟡 EXPIRING SOON' : '✅ OK'}`);
      console.log(`  Stock: ${med.quantity}/${med.lowStockThreshold} ${isLowStock ? '🔴 LOW STOCK' : '✅ OK'}`);
    });
    
    // Test the actual query
    console.log('\n🔍 Testing alert queries:');
    
    const lowStock = await Medication.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    });
    console.log(`Low stock medications: ${lowStock.length}`);
    
    const expiringSoon = await Medication.find({
      expiryDate: { 
        $gte: today,
        $lte: thirtyDaysFromNow 
      }
    });
    console.log(`Expiring soon medications: ${expiringSoon.length}`);
    
    if (expiringSoon.length > 0) {
      console.log('Expiring medications:');
      expiringSoon.forEach(med => {
        console.log(`  - ${med.name}: ${med.expiryDate.toISOString().split('T')[0]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugDatabase();