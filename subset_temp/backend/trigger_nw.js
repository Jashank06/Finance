const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Investment = require('./models/Investment');
const User = require('./models/User');

const toNum = (v) => parseFloat(v) || 0;

async function trigger() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ email: 'jaykumar0305@gmail.com' });
  const userId = user._id;

  // FETCH LOGIC FROM netWorth.js
  const investments = await Investment.find({ userId, isActive: { $ne: false } });
  
  let totalGold = 0;
  const investmentCategories = {
      'gold': ['gold', 'sgb', 'silver', 'bonds'],
  };

  console.log('--- Triggering Snapshot Calculation Logic ---');
  investments.forEach(inv => {
    const category = (inv.category || inv.investmentType || '').toLowerCase();
    
    let amount = 0;
    const q = parseFloat(inv.quantity);
    const cv = toNum(inv.currentValue);
    const amt = toNum(inv.amount);
    
    if (q > 0) {
        amount = (cv || amt) * q;
        console.log(`[DEBUG] ${inv.name}: q=${q}, cv=${cv}, amt=${amt} => result=${amount}`);
    } else {
        amount = toNum(inv.currentValue || inv.maturityAmount || inv.amount || inv.investedAmount);
        console.log(`[DEBUG] ${inv.name}: cv=${cv}, result=${amount}`);
    }

    if (investmentCategories.gold.some(k => category.includes(k))) {
        totalGold += amount;
    }
  });

  console.log(`\nFinal totalGold: ₹${totalGold.toLocaleString()}`);
  process.exit(0);
}
trigger();
