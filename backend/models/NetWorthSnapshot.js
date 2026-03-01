const mongoose = require('mongoose');

const NetWorthSnapshotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  netWorth: { type: Number, default: 0 },
  totalAssets: { type: Number, default: 0 },
  totalLiabilities: { type: Number, default: 0 },
  breakdown: {
    bankBalance: { type: Number, default: 0 },
    cashBalance: { type: Number, default: 0 },
    investments: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    loans: { type: Number, default: 0 }
  }
}, { timestamps: true });

// One snapshot per month per user
NetWorthSnapshotSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('NetWorthSnapshot', NetWorthSnapshotSchema);
