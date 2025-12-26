const mongoose = require('mongoose');
const path = require('path');
const Reminder = require('./backend/models/monitoring/Reminder');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const checkReminders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const total = await Reminder.countDocuments();
        const familyReminders = await Reminder.find({ category: 'family' });
        const personalReminders = await Reminder.find({ category: 'personal' });

        console.log(`Total reminders: ${total}`);
        console.log(`Family reminders count: ${familyReminders.length}`);
        console.log(`Personal reminders count: ${personalReminders.length}`);

        if (familyReminders.length > 0) {
            console.log('--- Family Reminders ---');
            familyReminders.forEach(r => {
                console.log(`Title: ${r.title}, Date: ${r.dateTime}, RefType: ${r.referenceType}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkReminders();
