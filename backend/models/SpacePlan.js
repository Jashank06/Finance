const mongoose = require('mongoose');

const spacePlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  storageSize: {
    type: Number, // in GB
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: '₹'
  },
  period: {
    type: String,
    enum: ['month', 'year', 'lifetime'],
    default: 'month'
  },
  features: [{
    type: String
  }],
  isPopular: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SpacePlan', spacePlanSchema);
