const mongoose = require('mongoose');

const featureUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  featureCategory: {
    type: String,
    enum: ['daily_finance', 'monitoring', 'investments', 'static_data', 'reports_analytics', 'family_management'],
    required: true,
    index: true
  },
  featureName: {
    type: String,
    required: true,
    index: true
  },
  route: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['view', 'create', 'update', 'delete', 'export', 'import'],
    default: 'view',
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sessionId: {
    type: String,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
featureUsageSchema.index({ userId: 1, timestamp: -1 });
featureUsageSchema.index({ featureCategory: 1, timestamp: -1 });
featureUsageSchema.index({ featureName: 1, timestamp: -1 });
featureUsageSchema.index({ timestamp: -1 });

// TTL index to automatically delete old records after 1 year (optional)
featureUsageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('FeatureUsage', featureUsageSchema);
