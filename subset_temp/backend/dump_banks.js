const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Bank = require('./models/Bank');

async function dump() {
  await mongoose.connect(process.env.MONGODB_URI);
  const allBanks = await Bank.find();
  console.log(JSON.stringify(allBanks, null, 2));
  process.exit(0);
}
dump();
