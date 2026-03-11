const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance');

const BasicDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mutualFunds: [mongoose.Schema.Types.Mixed],
  shares: [mongoose.Schema.Types.Mixed],
  insurance: [mongoose.Schema.Types.Mixed]
}, { strict: false });

const BasicDetails = mongoose.models.BasicDetails || mongoose.model('BasicDetails', BasicDetailsSchema);

async function check() {
  const details = await BasicDetails.findOne().lean();
  console.log("Mutual Funds DB Count:", details?.mutualFunds?.length || 0);
  console.log("Shares DB Count:", details?.shares?.length || 0);
  console.log("Insurance DB Count:", details?.insurance?.length || 0);
  console.log("Record ID:", details?._id || 'None found');
  mongoose.disconnect();
}
check();
