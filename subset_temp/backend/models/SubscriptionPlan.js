const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  tagline: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: '₹',
    trim: true
  },
  period: {
    type: String,
    default: 'month',
    enum: ['month', 'year', 'lifetime']
  },
  features: [{
    type: String,
    required: true
  }],
  featureCategories: [{
    type: String,
    enum: ['daily_finance', 'monitoring', 'investments', 'static_data', 'reports_analytics', 'family_management'],
    required: true
  }],
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: 'Get Started'
  },
  buttonLink: {
    type: String,
    default: '/signup'
  },
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  maxMembers: {
    type: Number,
    default: null // null means unlimited
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for ordering
subscriptionPlanSchema.index({ order: 1, active: 1 });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
