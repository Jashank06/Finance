/**
 * Cleanup Script: Remove Telephone Conversation entries from Calendar
 * 
 * This script removes calendar events that were created from Telephone Conversation module
 * which should not have been synced to the calendar.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CalendarEvent = require('../models/monitoring/CalendarEvent');
const Investment = require('../models/Investment');

async function cleanupTelephoneCalendarEntries() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all Telephone Conversation Investment entries
        const telephoneEntries = await Investment.find({
            category: 'daily-telephone-conversation'
        });

        console.log(`📊 Found ${telephoneEntries.length} Telephone Conversation entries\n`);

        if (telephoneEntries.length === 0) {
            console.log('✅ No Telephone Conversation entries found. Exiting...');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Get their IDs
        const telephoneIds = telephoneEntries.map(entry => entry._id);

        // Find calendar events linked to these entries
        const calendarEventsToDelete = await CalendarEvent.find({
            referenceId: { $in: telephoneIds },
            referenceType: 'Investment'
        });

        console.log(`🗑️  Found ${calendarEventsToDelete.length} calendar events to delete:\n`);
        
        calendarEventsToDelete.forEach((event, index) => {
            console.log(`   ${index + 1}. ${event.title} (${event.date.toISOString().slice(0, 10)})`);
        });

        // Delete calendar events
        const deleteResult = await CalendarEvent.deleteMany({
            referenceId: { $in: telephoneIds },
            referenceType: 'Investment'
        });

        console.log(`\n✅ Deleted ${deleteResult.deletedCount} calendar events from Telephone Conversation entries`);
        console.log('✅ Cleanup completed successfully!\n');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the cleanup
cleanupTelephoneCalendarEntries();
