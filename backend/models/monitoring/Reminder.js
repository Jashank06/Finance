const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['one-time', 'recurring'],
    default: 'one-time'
  },
  repeat: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'daily'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['personal', 'bills', 'health', 'work', 'family'],
    default: 'personal'
  },
  method: {
    type: String,
    enum: ['email'],
    default: 'email'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
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
reminderSchema.index({ userId: 1, dateTime: 1 });
reminderSchema.index({ userId: 1, category: 1 });
reminderSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
