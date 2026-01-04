require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Reminder = require('../models/monitoring/Reminder');
const { syncReminderToCalendar } = require('../utils/crossModuleSync');

async function syncAllReminders() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('📋 Fetching all active reminders...');
        const reminders = await Reminder.find({ status: 'active' });
        console.log(`Found ${reminders.length} active reminders\n`);

        let synced = 0;
        let skipped = 0;
        let errors = 0;

        for (const reminder of reminders) {
            try {
                console.log(`Syncing: ${reminder.title} (${reminder.referenceType})`);
                await syncReminderToCalendar(reminder);
                synced++;
            } catch (error) {
                console.error(`❌ Error syncing reminder ${reminder._id}:`, error.message);
                errors++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Synced: ${synced}`);
        console.log(`⏭️  Skipped: ${skipped}`);
        console.log(`❌ Errors: ${errors}`);
        console.log('\n✨ Sync completed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
        process.exit(0);
    }
}

syncAllReminders();
