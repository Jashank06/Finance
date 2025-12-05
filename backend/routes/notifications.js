const express = require('express');
const router = express.Router();
const Notification = require('../models/monitoring/Notification');
const { sendEmail } = require('../config/email');
const auth = require('../middleware/auth');

// Get all notifications for a user
router.get('/', auth, async (req, res) => {
  try {
    const { 
      type, 
      status,
      read,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const query = { userId: req.user.id };
    
    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by read status
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find(query)
      .sort({ scheduledTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    
    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notifications count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      read: false
    });
    
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Create new notification
router.post('/', auth, async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      userId: req.user.id
    };
    
    const notification = new Notification(notificationData);
    await notification.save();
    
    // Send email if method is email
    if (notification.method === 'email' && notification.recipients.length > 0) {
      try {
        const emailPromises = notification.recipients.map(recipient => {
          return sendEmail({
            to: recipient.email,
            subject: notification.title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">${notification.title}</h2>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #666; line-height: 1.6;">${notification.message}</p>
                </div>
                <div style="color: #999; font-size: 12px; margin-top: 20px;">
                  <p>This notification was sent from Family Finance App</p>
                  <p>Scheduled: ${new Date(notification.scheduledTime).toLocaleString()}</p>
                </div>
              </div>
            `
          });
        });
        
        await Promise.all(emailPromises);
        
        // Update notification status to sent
        notification.status = 'sent';
        notification.sentAt = new Date();
        await notification.save();
        
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        notification.status = 'failed';
        await notification.save();
      }
    }
    
    res.status(201).json({ notification });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(400).json({ 
      error: 'Failed to create notification',
      details: error.message 
    });
  }
});

// Update notification
router.put('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ notification });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(400).json({ 
      error: 'Failed to update notification',
      details: error.message 
    });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true, updatedAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ notification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true, updatedAt: new Date() }
    );
    
    res.json({ 
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get notification analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    // Notifications by type
    const notificationsByType = await Notification.aggregate([
      {
        $match: {
          userId: req.user.id,
          scheduledTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Status counts
    const statusCounts = await Notification.aggregate([
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
    
    // Method counts
    const methodCounts = await Notification.aggregate([
      {
        $match: {
          userId: req.user.id
        }
      },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Unread count
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      read: false
    });
    
    // Total this year
    const totalThisYear = await Notification.countDocuments({
      userId: req.user.id,
      scheduledTime: { $gte: startDate, $lte: endDate }
    });
    
    res.json({
      notificationsByType: notificationsByType.map(item => ({
        type: item._id,
        count: item.count
      })),
      statusCounts: statusCounts.map(item => ({
        status: item._id,
        count: item.count
      })),
      methodCounts: methodCounts.map(item => ({
        method: item._id,
        count: item.count
      })),
      unreadCount,
      totalThisYear,
      year: parseInt(year)
    });
  } catch (error) {
    console.error('Get notification analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch notification analytics' });
  }
});

module.exports = router;
