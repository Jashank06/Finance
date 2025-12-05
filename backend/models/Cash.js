const mongoose = require('mongoose');

const cashSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['physical-cash', 'digital-wallet', 'cryptocurrency', 'other'],
  },
  name: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'OTHER'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  location: {
    type: String,
    required: function() {
      return this.type === 'physical-cash';
    },
  },
  // Digital wallet specific fields
  walletProvider: {
    type: String,
    required: function() {
      return this.type === 'digital-wallet';
    },
  },
  walletNumber: String,
  walletType: {
    type: String,
    enum: ['prepaid', 'postpaid', 'gift-card'],
  },
  // Cryptocurrency specific fields
  cryptoType: {
    type: String,
    required: function() {
      return this.type === 'cryptocurrency';
    },
  },
  exchange: String,
  walletAddress: String,
  // Common fields
  description: String,
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  notes: String,
  documents: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cashSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('Cash', cashSchema);
