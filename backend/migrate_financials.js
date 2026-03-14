const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const models = [
  'CashMember',
  'CashTransaction',
  'Cash',
  'Card',
  'Bank',
  'Transaction',
  'BankTransaction',
  'Investment'
];

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const modelName of models) {
      const Model = mongoose.model(modelName, new mongoose.Schema({
        section: { type: String, enum: ['family', 'business'], default: 'family' },
        businessId: { type: String, default: null }
      }, { strict: false }));

      const result = await Model.updateMany(
        { section: { $exists: false } },
        { $set: { section: 'family', businessId: null } }
      );
      
      console.log(`Migrated ${modelName}: ${result.modifiedCount} records updated`);
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
