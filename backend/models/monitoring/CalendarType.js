const mongoose = require('mongoose');

const calendarTypeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  id: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    default: '#3B82F6'
  },
  visible: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
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

// Indexes for better performance
calendarTypeSchema.index({ userId: 1 });
calendarTypeSchema.index({ userId: 1, id: 1 }, { unique: true });

module.exports = mongoose.model('CalendarType', calendarTypeSchema);
