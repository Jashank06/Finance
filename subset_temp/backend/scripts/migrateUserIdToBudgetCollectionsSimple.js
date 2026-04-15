require('dotenv').config();
const mongoose = require('mongoose');

// Get userId from command line argument
const targetUserId = process.argv[2];

if (!targetUserId) {
  console.log('Usage: node migrateUserIdToBudgetCollectionsSimple.js <userId>');
  console.log('Example: node migrateUserIdToBudgetCollectionsSimple.js 695005f1b6e4af4e2af2404c');
  process.exit(1);
}

// Define schemas
const chequeRegisterSchema = new mongoose.Schema({}, { strict: false });
const dailyCashSchema = new mongoose.Schema({}, { strict: false });
const milestoneSchema = new mongoose.Schema({}, { strict: false });
const targetSchema = new mongoose.Schema({}, { strict: false });

const ChequeRegister = mongoose.model('ChequeRegister', chequeRegisterSchema);
const DailyCash = mongoose.model('DailyCash', dailyCashSchema);
const Milestone = mongoose.model('Milestone', milestoneSchema);
const Target = mongoose.model('Target', targetSchema);

async function migrateData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Validate userId
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      firstName: String,
      lastName: String
    }));

    const user = await User.findById(targetUserId);
    if (!user) {
      console.log(`❌ User with ID ${targetUserId} not found`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email} (${user._id})\n`);

    // Check existing records without userId
    const chequeWithoutUser = await ChequeRegister.countDocuments({ userId: { $exists: false } });
    const cashWithoutUser = await DailyCash.countDocuments({ userId: { $exists: false } });
    const milestoneWithoutUser = await Milestone.countDocuments({ userId: { $exists: false } });
    const targetWithoutUser = await Target.countDocuments({ userId: { $exists: false } });

    console.log('📊 Records without userId:');
    console.log(`   - Cheque Register: ${chequeWithoutUser}`);
    console.log(`   - Daily Cash: ${cashWithoutUser}`);
    console.log(`   - Milestones: ${milestoneWithoutUser}`);
    console.log(`   - Targets: ${targetWithoutUser}`);

    if (chequeWithoutUser === 0 && cashWithoutUser === 0 && milestoneWithoutUser === 0 && targetWithoutUser === 0) {
      console.log('\n✅ All records already have userId. No migration needed!');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('\n🔄 Starting migration...\n');

    // Migrate Cheque Register
    if (chequeWithoutUser > 0) {
      const chequeResult = await ChequeRegister.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: new mongoose.Types.ObjectId(targetUserId) } }
      );
      console.log(`✅ Cheque Register: Updated ${chequeResult.modifiedCount} records`);
    }

    // Migrate Daily Cash
    if (cashWithoutUser > 0) {
      const cashResult = await DailyCash.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: new mongoose.Types.ObjectId(targetUserId) } }
      );
      console.log(`✅ Daily Cash: Updated ${cashResult.modifiedCount} records`);
    }

    // Migrate Milestones
    if (milestoneWithoutUser > 0) {
      const milestoneResult = await Milestone.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: new mongoose.Types.ObjectId(targetUserId) } }
      );
      console.log(`✅ Milestones: Updated ${milestoneResult.modifiedCount} records`);
    }

    // Migrate Targets
    if (targetWithoutUser > 0) {
      const targetResult = await Target.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: new mongoose.Types.ObjectId(targetUserId) } }
      );
      console.log(`✅ Targets: Updated ${targetResult.modifiedCount} records`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Final count:');
    console.log(`   - Cheque Register with userId: ${await ChequeRegister.countDocuments({ userId: { $exists: true } })}`);
    console.log(`   - Daily Cash with userId: ${await DailyCash.countDocuments({ userId: { $exists: true } })}`);
    console.log(`   - Milestones with userId: ${await Milestone.countDocuments({ userId: { $exists: true } })}`);
    console.log(`   - Targets with userId: ${await Target.countDocuments({ userId: { $exists: true } })}`);

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
