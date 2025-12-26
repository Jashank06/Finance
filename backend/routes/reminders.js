const express = require('express');
const router = express.Router();
const Reminder = require('../models/monitoring/Reminder');
const auth = require('../middleware/auth');

// Get all reminders for a user
router.get('/', auth, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      status,
      priority,
      showPassed,
      page = 1,
      limit = 50
    } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = { userId: req.user.id };
    let sort = { dateTime: 1 };

    if (showPassed === 'true') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      query.dateTime = { $lt: today, $gte: thirtyDaysAgo };
      sort = { dateTime: -1 }; // Show most recent past reminders first
    } else {
      // Default: Upcoming with visibility logic
      query.dateTime = { $gte: today };
      query.status = 'active';

      // Visibility threshold logic: today >= (dateTime - leadDays)
      const visibilityQuery = {
        $expr: {
          $lte: [
            "$dateTime",
            { $add: [today, { $multiply: ["$leadDays", 86400000] }] }
          ]
        }
      };

      // Combine into $and
      query = { $and: [query, visibilityQuery] };
    }

    // Filter by date range (if provided, overrides above auto-logic for search)
    if (startDate || endDate) {
      if (query.$and) delete query.$and;
      query.dateTime = {};
      if (startDate) query.dateTime.$gte = new Date(startDate);
      if (endDate) query.dateTime.$lte = new Date(endDate);
      sort = { dateTime: 1 };
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const skip = (page - 1) * limit;

    const reminders = await Reminder.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reminder.countDocuments(query);

    res.json({
      reminders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Get upcoming reminders
router.get('/upcoming', auth, async (req, res) => {
  try {
    const { days = 30, category } = req.query;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const query = {
      userId: req.user.id,
      status: 'active',
      dateTime: { $gte: startDate },
      $expr: {
        $lte: [
          "$dateTime",
          { $add: [startDate, { $multiply: ["$leadDays", 86400000] }] }
        ]
      }
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    const reminders = await Reminder.find(query)
      .sort({ dateTime: 1 })
      .limit(20);

    res.json({ reminders });
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming reminders' });
  }
});

// Create new reminder
router.post('/', auth, async (req, res) => {
  try {
    const reminderData = {
      ...req.body,
      userId: req.user.id
    };

    const reminder = new Reminder(reminderData);
    await reminder.save();

    res.status(201).json({ reminder });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(400).json({
      error: 'Failed to create reminder',
      details: error.message
    });
  }
});

// Update reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ reminder });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(400).json({
      error: 'Failed to update reminder',
      details: error.message
    });
  }
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

// Toggle reminder status
router.patch('/:id/toggle-status', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    reminder.status = reminder.status === 'active' ? 'paused' : 'active';
    reminder.updatedAt = new Date();
    await reminder.save();

    res.json({ reminder });
  } catch (error) {
    console.error('Toggle reminder status error:', error);
    res.status(500).json({ error: 'Failed to toggle reminder status' });
  }
});

// Get reminder analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Reminders by category
    const remindersByCategory = await Reminder.aggregate([
      {
        $match: {
          userId: req.user.id,
          dateTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Reminders by priority
    const remindersByPriority = await Reminder.aggregate([
      {
        $match: {
          userId: req.user.id,
          dateTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Status counts
    const statusCounts = await Reminder.aggregate([
      {
        $match: {
          userId: req.user.id
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Upcoming count
    const upcomingCount = await Reminder.countDocuments({
      userId: req.user.id,
      dateTime: { $gte: new Date() },
      status: 'active'
    });

    // Total this year
    const totalThisYear = await Reminder.countDocuments({
      userId: req.user.id,
      dateTime: { $gte: startDate, $lte: endDate }
    });

    res.json({
      remindersByCategory: remindersByCategory.map(item => ({
        category: item._id,
        count: item.count
      })),
      remindersByPriority: remindersByPriority.map(item => ({
        priority: item._id,
        count: item.count
      })),
      statusCounts: statusCounts.map(item => ({
        status: item._id,
        count: item.count
      })),
      upcomingCount,
      totalThisYear,
      year: parseInt(year)
    });
  } catch (error) {
    console.error('Get reminder analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch reminder analytics' });
  }
});

module.exports = router;
