const express = require('express');
const router = express.Router();
const CalendarEvent = require('../models/monitoring/CalendarEvent');
const auth = require('../middleware/auth');
const { syncCalendarToReminder, deleteLinkedEntries } = require('../utils/crossModuleSync');

// Get all events for a user
router.get('/', auth, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      calendar,
      page = 1,
      limit = 50
    } = req.query;

    const query = { userId: req.user.id };

    // Filter by date range (including recurring events)
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      query.$or = [
        // Literal date match
        {
          date: {
            ...(start && { $gte: start }),
            ...(end && { $lte: end })
          }
        },
        // Recurring events that might overlap with this range
        {
          repeat: { $ne: null },
          // Must have started before or during the range
          ...(end && { date: { $lte: end } }),
          // Must not have ended before the range
          $or: [
            { repeatEndDate: null },
            ...(start ? [{ repeatEndDate: { $gte: start } }] : [])
          ]
        }
      ];
    }

    // Filter by calendar
    if (calendar && calendar !== 'all') {
      query.calendar = calendar;
    }

    const skip = (page - 1) * limit;

    const events = await CalendarEvent.find(query)
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CalendarEvent.countDocuments(query);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Get events for a specific month
router.get('/month/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const { calendar } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const query = {
      userId: req.user.id,
      $or: [
        // Literal date match
        {
          date: {
            $gte: startDate,
            $lte: endDate
          }
        },
        // Recurring events
        {
          repeat: { $ne: null },
          date: { $lte: endDate },
          $or: [
            { repeatEndDate: null },
            { repeatEndDate: { $gte: startDate } }
          ]
        }
      ]
    };

    if (calendar && calendar !== 'all') {
      query.calendar = calendar;
    }

    const events = await CalendarEvent.find(query)
      .sort({ date: 1, time: 1 });

    res.json({ events });
  } catch (error) {
    console.error('Get month events error:', error);
    res.status(500).json({ error: 'Failed to fetch month events' });
  }
});

// Get upcoming events
router.get('/upcoming', auth, async (req, res) => {
  try {
    const { days = 30, calendar } = req.query;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const query = {
      userId: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      },
      status: 'active'
    };

    if (calendar && calendar !== 'all') {
      query.calendar = calendar;
    }

    const events = await CalendarEvent.find(query)
      .sort({ date: 1, time: 1 })
      .limit(20);

    res.json({ events });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// Create new event
router.post('/', auth, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      userId: req.user.id
    };

    const event = new CalendarEvent(eventData);
    await event.save();

    // Sync to Reminders
    try {
      await syncCalendarToReminder(event);
    } catch (syncError) {
      console.error('Error syncing calendar event to reminders:', syncError);
    }

    res.status(201).json({ event });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(400).json({
      error: 'Failed to create calendar event',
      details: error.message
    });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Sync to Reminders
    try {
      await syncCalendarToReminder(event);
    } catch (syncError) {
      console.error('Error syncing calendar event to reminders:', syncError);
    }

    res.json({ event });
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(400).json({
      error: 'Failed to update calendar event',
      details: error.message
    });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Delete linked entries
    try {
      await deleteLinkedEntries(event._id);
    } catch (syncError) {
      console.error('Error deleting linked entries:', syncError);
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

// Get calendar analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Events by calendar
    const eventsByCalendar = await CalendarEvent.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$calendar',
          count: { $sum: 1 }
        }
      }
    ]);

    // Events by month
    const eventsByMonth = await CalendarEvent.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Upcoming events count
    const upcomingCount = await CalendarEvent.countDocuments({
      userId: req.user.id,
      date: { $gte: new Date() },
      status: 'active'
    });

    // Total events this year
    const totalEvents = await CalendarEvent.countDocuments({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    res.json({
      eventsByCalendar: eventsByCalendar.map(item => ({
        calendar: item._id,
        count: item.count
      })),
      eventsByMonth: eventsByMonth.map(item => ({
        month: item._id,
        count: item.count
      })),
      upcomingCount,
      totalEvents,
      year: parseInt(year)
    });
  } catch (error) {
    console.error('Get calendar analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar analytics' });
  }
});

// Bulk operations
router.post('/bulk', auth, async (req, res) => {
  try {
    const { events, operation } = req.body;

    if (operation === 'create') {
      const eventsToCreate = events.map(event => ({
        ...event,
        userId: req.user.id
      }));

      const createdEvents = await CalendarEvent.insertMany(eventsToCreate);
      res.status(201).json({ events: createdEvents });
    } else if (operation === 'delete') {
      const result = await CalendarEvent.deleteMany({
        _id: { $in: events },
        userId: req.user.id
      });
      res.json({ deletedCount: result.deletedCount });
    } else {
      res.status(400).json({ error: 'Invalid bulk operation' });
    }
  } catch (error) {
    console.error('Bulk calendar operation error:', error);
    res.status(400).json({
      error: 'Failed to perform bulk operation',
      details: error.message
    });
  }
});

module.exports = router;
