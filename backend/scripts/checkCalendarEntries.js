const mongoose = require('mongoose');
require('dotenv').config();

const CalendarEvent = require('../models/monitoring/CalendarEvent');

async function checkCalendarEntries() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all calendar events with "Bill:" in title
        const billEvents = await CalendarEvent.find({
            title: /^Bill:/i
        });

        console.log(`📊 Found ${billEvents.length} calendar events with "Bill:" prefix:\n`);
        
        billEvents.forEach((event, index) => {
            console.log(`${index + 1}. Title: "${event.title}"`);
            console.log(`   Category: ${event.category}`);
            console.log(`   Reference Type: ${event.referenceType}`);
            console.log(`   Reference ID: ${event.referenceId}`);
            console.log(`   Date: ${event.date.toISOString().slice(0, 10)}`);
            console.log(`   User ID: ${event.userId}\n`);
        });

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

checkCalendarEntries();
