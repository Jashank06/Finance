const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Investment = require('./models/Investment');
const User = require('./models/User');

const toNum = (v) => parseFloat(v) || 0;

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ email: 'jaykumar0305@gmail.com' });
  const userId = user._id;
  const investments = await Investment.find({ userId, isActive: { $ne: false } });
  
  const investmentCategories = {
      'gold': ['gold', 'sgb', 'silver', 'bonds'],
  };

  console.log(`--- Gold & Bonds Breakdown for ${user.email} ---`);
  investments.forEach(inv => {
    const category = (inv.category || inv.investmentType || '').toLowerCase();
    const isGold = investmentCategories.gold.some(k => category.includes(k));
    if (!isGold) return;

    console.log(`- ${inv.name} [qty: ${inv.quantity}, curVal: ${inv.currentValue}, amt: ${inv.amount}]`);
  });
  
  process.exit(0);
}
check();
