const mongoose = require('mongoose');
require('dotenv').config();

const CalendarEvent = require('../models/monitoring/CalendarEvent');
const Investment = require('../models/Investment');

async function deleteUnwantedCalendarEntries() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all calendar events with "Bill:" prefix
        const billEvents = await CalendarEvent.find({
            title: /^Bill:/i,
            referenceType: 'Investment'
        });

        console.log(`📊 Found ${billEvents.length} calendar events with "Bill:" prefix\n`);
        
        const entriesToDelete = [];
        
        // Check each event's Investment category
        for (const event of billEvents) {
            const investment = await Investment.findById(event.referenceId);
            
            if (investment) {
                const shouldDelete = investment.category !== 'daily-bill-checklist' && 
                                   investment.category !== 'daily-bill-checklist-new';
                
                if (shouldDelete) {
                    entriesToDelete.push({
                        eventId: event._id,
                        title: event.title,
                        category: investment.category,
                        date: event.date
                    });
                    console.log(`🗑️  Will delete: "${event.title}"`);
                    console.log(`   Investment Category: ${investment.category}`);
                    console.log(`   Date: ${event.date.toISOString().slice(0, 10)}\n`);
                }
            } else {
                // Investment not found - orphaned calendar entry
                console.log(`⚠️  Orphaned entry (Investment not found): "${event.title}"`);
            }
        }

        if (entriesToDelete.length === 0) {
            console.log('✅ No unwanted entries found to delete!');
            await mongoose.disconnect();
            process.exit(0);
        }

        console.log(`\n📊 Total entries to delete: ${entriesToDelete.length}\n`);
        
        // Delete the entries
        const eventIds = entriesToDelete.map(e => e.eventId);
        const deleteResult = await CalendarEvent.deleteMany({
            _id: { $in: eventIds }
        });

        console.log(`✅ Successfully deleted ${deleteResult.deletedCount} calendar events!`);
        console.log('\nDeleted entries:');
        entriesToDelete.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.title} (${entry.category})`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

deleteUnwantedCalendarEntries();
