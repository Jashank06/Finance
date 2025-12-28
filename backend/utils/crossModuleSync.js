const CalendarEvent = require('../models/monitoring/CalendarEvent');
const Reminder = require('../models/monitoring/Reminder');
const { syncReminder, deleteReminders } = require('./reminderSyncUtil');

/**
 * Sync an entry to the Calendar
 */
const syncToCalendar = async ({
    userId,
    title,
    date,
    category = 'other',
    description = '',
    referenceId,
    referenceType,
    repeat = null,
    repeatEndDate = null,
    status = 'active'
}) => {
    if (!date) return;

    try {
        const eventDate = new Date(date);
        if (isNaN(eventDate.getTime())) return;

        const query = {
            userId,
            referenceId,
            referenceType
        };

        const eventData = {
            userId,
            title,
            description,
            date: eventDate,
            category,
            repeat: repeat === 'none' ? null : repeat,
            repeatEndDate,
            referenceId,
            referenceType,
            status: status === 'paid' ? 'completed' : (status === 'cancelled' ? 'cancelled' : 'active')
        };

        const existingEvent = await CalendarEvent.findOne(query);

        if (existingEvent) {
            Object.assign(existingEvent, eventData);
            await existingEvent.save();
            return existingEvent;
        } else {
            const newEvent = await CalendarEvent.create(eventData);
            return newEvent;
        }
    } catch (error) {
        console.error('Error syncing to calendar:', error);
    }
};

/**
 * Delete all linked entries for a reference
 */
const deleteLinkedEntries = async (referenceId) => {
    try {
        await Promise.all([
            CalendarEvent.deleteMany({ referenceId }),
            deleteReminders(referenceId)
        ]);
        console.log(`Deleted all linked entries for reference: ${referenceId}`);
    } catch (error) {
        console.error('Error deleting linked entries:', error);
    }
};

/**
 * Sync Investment (Bill) to All modules
 */
const syncInvestmentToAll = async (investment) => {
    const targetDate = investment.payableDate || investment.maturityDate || investment.startDate;
    if (!targetDate) return;

    let title = investment.name;
    let category = 'other';
    let repeat = investment.frequency !== 'one-time' ? investment.frequency : null;

    // Status handling
    let isPaid = investment.status === 'paid';
    if (!isPaid && investment.notes) {
        try {
            const notes = JSON.parse(investment.notes);
            if (notes.status === 'paid') isPaid = true;
        } catch (e) { }
    }

    // Determine calendar category
    if (investment.category === 'daily-bill-checklist' || investment.category === 'daily-bill-checklist-new') {
        category = 'policy-renewal'; // Closest match for recurring bills
    }

    // Sync to Calendar
    await syncToCalendar({
        userId: investment.userId,
        title: `Bill: ${title}`,
        date: targetDate,
        category: category,
        referenceId: investment._id,
        referenceType: 'Investment',
        repeat: repeat,
        status: isPaid ? 'completed' : 'active'
    });

    // Sync to Reminders (reusing existing utility logic)
    const { syncInvestmentToReminders } = require('./reminderSyncUtil');
    await syncInvestmentToReminders(investment);
};

/**
 * Sync Calendar Event to Reminders
 */
const syncCalendarToReminder = async (event) => {
    // Avoid double-sync loops by checking if this event originated from a different module
    if (event.referenceType && event.referenceType !== 'Reminder') {
        // This event came from elsewhere, don't sync it back or to reminders if already handled
        // Actually, we WANT Calendar -> Reminder sync if it was created manually in Calendar
        return;
    }

    const recurring = !!event.repeat;

    await syncReminder({
        userId: event.userId,
        title: `Reminder: ${event.title}`,
        date: event.date,
        category: 'personal',
        referenceId: event._id,
        referenceType: 'CalendarEvent',
        description: event.description,
        recurring: recurring,
        frequency: event.repeat,
        status: event.status === 'completed' ? 'completed' : 'active'
    });
};

/**
 * Sync Reminder to Calendar
 */
const syncReminderToCalendar = async (reminder) => {
    // Avoid double-sync loops
    if (reminder.referenceType && reminder.referenceType !== 'CalendarEvent') {
        return;
    }

    await syncToCalendar({
        userId: reminder.userId,
        title: `Event: ${reminder.title}`,
        date: reminder.dateTime,
        category: 'other',
        referenceId: reminder._id,
        referenceType: 'Reminder',
        repeat: reminder.type === 'recurring' ? reminder.repeat : null,
        status: reminder.status
    });
};

module.exports = {
    syncToCalendar,
    deleteLinkedEntries,
    syncInvestmentToAll,
    syncCalendarToReminder,
    syncReminderToCalendar
};
