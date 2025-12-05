const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
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
  calendar: {
    type: String,
    enum: ['family', 'personal', 'work', 'holidays'],
    default: 'family'
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    trim: true
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  reminder: {
    type: String,
    enum: ['5-minutes', '15-minutes', '30-minutes', '1-hour', '1-day', '1-week'],
    default: null
  },
  repeat: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  attendees: [{
    name: String,
    email: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
calendarEventSchema.index({ userId: 1, date: 1 });
calendarEventSchema.index({ userId: 1, calendar: 1 });
calendarEventSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
