require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

// Define schemas
const chequeRegisterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receivedDate: { type: Date, required: true },
  chequeDepositDate: { type: Date },
  difference: { type: Number },
  reasonForDelay: { type: String },
  chequePartyDetails: { type: String },
  accountHead: { type: String },
  deposit: { type: Number },
  withdrawal: { type: Number },
  amount: { type: Number },
  bank: { type: String },
  chequeNumber: { type: String },
  chequeDepositedInBank: { type: String },
  receivedFor: { type: String },
  receivedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const dailyCashSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: { type: Date, required: true },
  description: { type: String },
  credit: { type: Number },
  debit: { type: Number },
  balance: { type: Number },
  category: { type: String },
  affectedAccount: { type: String },
  additionalDetails: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const milestoneSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'planning'
  },
  priority: { type: String },
  progress: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const ChequeRegister = mongoose.model('ChequeRegister', chequeRegisterSchema);
const DailyCash = mongoose.model('DailyCash', dailyCashSchema);
const Milestone = mongoose.model('Milestone', milestoneSchema);

// Function to get user input
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function migrateData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables');
      console.log('Please set MONGODB_URI or MONGO_URI in your .env file');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      firstName: String,
      lastName: String
    }));

    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('❌ No users found in the database. Please create a user first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} user(s):`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.firstName} ${user.lastName} (ID: ${user._id})`);
    });

    // Check existing records without userId
    const chequeWithoutUser = await ChequeRegister.countDocuments({ userId: { $exists: false } });
    const cashWithoutUser = await DailyCash.countDocuments({ userId: { $exists: false } });
    const milestoneWithoutUser = await Milestone.countDocuments({ userId: { $exists: false } });

    console.log('\n📊 Records without userId:');
    console.log(`   - Cheque Register: ${chequeWithoutUser}`);
    console.log(`   - Daily Cash: ${cashWithoutUser}`);
    console.log(`   - Milestones: ${milestoneWithoutUser}`);

    if (chequeWithoutUser === 0 && cashWithoutUser === 0 && milestoneWithoutUser === 0) {
      console.log('\n✅ All records already have userId. No migration needed!');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Ask which user to assign records to
    const userIndex = await askQuestion('\nEnter the user number to assign all records to: ');
    const selectedUser = users[parseInt(userIndex) - 1];

    if (!selectedUser) {
      console.log('❌ Invalid user selection');
      process.exit(1);
    }

    console.log(`\n✅ Selected user: ${selectedUser.email} (${selectedUser._id})`);

    // Confirm migration
    const confirm = await askQuestion('\n⚠️  This will add userId to all records without one. Continue? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Migration cancelled.');
      process.exit(0);
    }

    console.log('\n🔄 Starting migration...\n');

    // Migrate Cheque Register
    if (chequeWithoutUser > 0) {
      const chequeResult = await ChequeRegister.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: selectedUser._id } }
      );
      console.log(`✅ Cheque Register: Updated ${chequeResult.modifiedCount} records`);
    }

    // Migrate Daily Cash
    if (cashWithoutUser > 0) {
      const cashResult = await DailyCash.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: selectedUser._id } }
      );
      console.log(`✅ Daily Cash: Updated ${cashResult.modifiedCount} records`);
    }

    // Migrate Milestones
    if (milestoneWithoutUser > 0) {
      const milestoneResult = await Milestone.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: selectedUser._id } }
      );
      console.log(`✅ Milestones: Updated ${milestoneResult.modifiedCount} records`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Final count:');
    console.log(`   - Cheque Register with userId: ${await ChequeRegister.countDocuments({ userId: { $exists: true } })}`);
    console.log(`   - Daily Cash with userId: ${await DailyCash.countDocuments({ userId: { $exists: true } })}`);
    console.log(`   - Milestones with userId: ${await Milestone.countDocuments({ userId: { $exists: true } })}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migrateData();
