const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Investment = require('./models/Investment');
const User = require('./models/User');

const toNum = (v) => parseFloat(v) || 0;

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ email: 'jaykumar0305@gmail.com' });
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }
  
  const investments = await Investment.find({ userId: user._id, isActive: { $ne: false } });
  
  console.log('--- Simulation of netWorth.js logic ---');
  investments.forEach(inv => {
    if (inv.name !== 'Digital Gold') return;

    console.log(`Record for: ${inv.name}`);
    console.log(`- quantity: ${inv.quantity} (type: ${typeof inv.quantity})`);
    console.log(`- currentValue: ${inv.currentValue} (type: ${typeof inv.currentValue})`);
    console.log(`- amount: ${inv.amount}`);
    
    // Exact logic from netWorth.js
    let amount = 0;
    if (inv.quantity && inv.quantity > 0) {
        amount = toNum(inv.currentValue || inv.amount || inv.investedAmount) * inv.quantity;
        console.log(`   > Multiplication branch hit!`);
    } else {
        amount = toNum(inv.currentValue || inv.maturityAmount || inv.amount || inv.investedAmount);
        console.log(`   > Fallback branch hit!`);
    }
    
    console.log(`- Final calculated amount: ₹${amount.toLocaleString()}`);
  });
  
  process.exit(0);
}
debug();
