const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');
const jwt = require('jsonwebtoken');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'jaykumar0305@gmail.com' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');

  try {
    console.log('Hitting API: http://localhost:5001/api/net-worth/snapshot');
    const res = await axios.get('http://localhost:5001/api/net-worth/snapshot', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('API Response Gold Total:', res.data.data.breakdown.gold.total);
  } catch (e) {
    console.error('API Error:', e.message);
  }
  process.exit(0);
}
test();
