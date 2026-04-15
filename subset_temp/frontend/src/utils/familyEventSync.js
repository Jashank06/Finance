/**
 * Utility to automatically sync birthdays and anniversaries from Family Profile
 * to the Calendar system (Yearly Calendar and Multiple Calendars)
 */

import { staticAPI } from './staticAPI';
import calendarAPI from '../api/calendar';

/**
 * Sync birthdays and anniversaries from Family Profile to Calendar
 * @returns {Object} Result with count of synced events
 */
export const syncFamilyEventsToCalendar = async () => {
  try {
    // Fetch family profile data
    const response = await staticAPI.getFamilyProfile();
    
    if (!response.data || response.data.length === 0) {
      return { success: true, count: 0, message: 'No family profile found' };
    }

    const familyProfile = response.data[0];
    const members = familyProfile.members || [];
    
    let syncedCount = 0;
    const errors = [];

    for (const member of members) {
      try {
        // Sync Birthday
        if (member.dateOfBirth) {
          const birthdayEvent = {
            title: `${member.name}'s Birthday`,
            description: `Birthday of ${member.name} (${member.relation || 'Family Member'})`,
            date: member.dateOfBirth,
            time: '00:00',
            datetime: `${member.dateOfBirth}T00:00:00`,
            calendar: 'family',
            category: 'birthday',
            repeat: 'yearly',
            reminder: '1-day',
            location: '',
            attendees: []
          };

          await calendarAPI.create(birthdayEvent);
          syncedCount++;
        }

        // Sync Anniversary
        if (member.anniversaryDate) {
          const anniversaryEvent = {
            title: `${member.name}'s Anniversary`,
            description: `Wedding anniversary of ${member.name} (${member.relation || 'Family Member'})`,
            date: member.anniversaryDate,
            time: '00:00',
            datetime: `${member.anniversaryDate}T00:00:00`,
            calendar: 'family',
            category: 'anniversary',
            repeat: 'yearly',
            reminder: '1-day',
            location: '',
            attendees: []
          };

          await calendarAPI.create(anniversaryEvent);
          syncedCount++;
        }
      } catch (error) {
        console.error(`Error syncing events for ${member.name}:`, error);
        errors.push({ member: member.name, error: error.message });
      }
    }

    return {
      success: true,
      count: syncedCount,
      errors: errors.length > 0 ? errors : null,
      message: `Synced ${syncedCount} family events to calendar`
    };
  } catch (error) {
    console.error('Error syncing family events to calendar:', error);
    return {
      success: false,
      count: 0,
      error: error.message
    };
  }
};

/**
 * Check if a family event (birthday/anniversary) already exists in calendar
 * @param {string} memberName - Name of the family member
 * @param {string} eventType - 'Birthday' or 'Anniversary'
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<boolean>} True if event exists
 */
export const checkFamilyEventExists = async (memberName, eventType, date) => {
  try {
    const year = new Date(date).getFullYear();
    const response = await calendarAPI.getYearEvents(year);
    const events = response.events || [];

    const eventTitle = `${memberName}'s ${eventType}`;
    const categoryValue = eventType.toLowerCase();
    return events.some(event => 
      event.title === eventTitle && 
      event.calendar === 'family' &&
      event.category === categoryValue &&
      event.repeat === 'yearly'
    );
  } catch (error) {
    console.error('Error checking family event:', error);
    return false;
  }
};

/**
 * Update or create a single family event
 * @param {Object} member - Family member object
 * @param {string} eventType - 'birthday' or 'anniversary'
 * @returns {Promise<Object>} Result of the operation
 */
export const syncSingleFamilyEvent = async (member, eventType) => {
  try {
    const dateField = eventType === 'birthday' ? 'dateOfBirth' : 'anniversaryDate';
    const eventDate = member[dateField];

    if (!eventDate) {
      return { success: false, message: `No ${eventType} date found for ${member.name}` };
    }

    const eventTitle = `${member.name}'s ${eventType === 'birthday' ? 'Birthday' : 'Anniversary'}`;
    const eventDescription = eventType === 'birthday' 
      ? `Birthday of ${member.name} (${member.relation || 'Family Member'})`
      : `Wedding anniversary of ${member.name} (${member.relation || 'Family Member'})`;

    // Check if event already exists
    const exists = await checkFamilyEventExists(
      member.name, 
      eventType === 'birthday' ? 'Birthday' : 'Anniversary',
      eventDate
    );

    if (exists) {
      return { 
        success: true, 
        skipped: true, 
        message: `${eventTitle} already exists in calendar` 
      };
    }

    // Create new event
    const categoryValue = eventType === 'birthday' ? 'birthday' : 'anniversary';
    const eventData = {
      title: eventTitle,
      description: eventDescription,
      date: eventDate,
      time: '00:00',
      datetime: `${eventDate}T00:00:00`,
      calendar: 'family',
      category: categoryValue,
      repeat: 'yearly',
      reminder: '1-day',
      location: '',
      attendees: []
    };

    console.log('Creating family event:', eventData);
    const result = await calendarAPI.create(eventData);
    console.log('Event created:', result);
    
    return { 
      success: true, 
      message: `${eventTitle} added to calendar`,
      eventId: result.event?._id
    };
  } catch (error) {
    console.error(`Error syncing ${eventType} for ${member.name}:`, error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};
