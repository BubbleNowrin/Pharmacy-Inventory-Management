// Quick test script to check the sample data
const sampleData = [
  {
    "name": "Paracetamol",
    "category": "Painkiller",
    "quantity": 50,
    "unit": "tablet",
    "price": 0.5,
    "expiryDate": "2025-12-09",
    "batchNumber": "BATCH001",
    "supplier": "MedCo",
    "lowStockThreshold": 10
  },
  {
    "name": "ORS Solution",
    "category": "Electrolyte",
    "quantity": 100,
    "unit": "sachet",
    "price": 0.25,
    "expiryDate": "2025-12-05", // This should show as expiring soon
    "batchNumber": "BATCH012",
    "supplier": "Hydratix",
    "lowStockThreshold": 25
  },
  {
    "name": "Insulin",
    "category": "Diabetes",
    "quantity": 25,
    "unit": "vial",
    "price": 12.5,
    "expiryDate": "2025-11-28", // This might be expired already
    "batchNumber": "BATCH016",
    "supplier": "DiaMed",
    "lowStockThreshold": 5
  }
];

const today = new Date();
const thirtyDaysFromNow = new Date();
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

console.log('Today:', today.toISOString().split('T')[0]);
console.log('30 days from now:', thirtyDaysFromNow.toISOString().split('T')[0]);
console.log('\nChecking sample medications:');

sampleData.forEach(med => {
  const expiryDate = new Date(med.expiryDate);
  const isExpired = expiryDate < today;
  const isExpiringSoon = expiryDate >= today && expiryDate <= thirtyDaysFromNow;
  const isLowStock = med.quantity <= med.lowStockThreshold;
  
  console.log(`${med.name}:`);
  console.log(`  Expiry: ${med.expiryDate} - ${isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING SOON' : 'OK'}`);
  console.log(`  Stock: ${med.quantity}/${med.lowStockThreshold} - ${isLowStock ? 'LOW STOCK' : 'OK'}`);
  console.log('');
});