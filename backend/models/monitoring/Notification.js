const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  method: {
    type: String,
    enum: ['email'],
    default: 'email'
  },
  recipients: [{
    name: String,
    email: String,
    phone: String
  }],
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'failed'],
    default: 'scheduled'
  },
  read: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
notificationSchema.index({ userId: 1, scheduledTime: 1 });
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
