const mongoose = require('mongoose');

const cashMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
    required: true,
    enum: ['self', 'spouse', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'other'],
  },
  budget: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  initialBalance: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  currentBalance: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'OTHER'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cashMemberSchema.pre('save', function() {
  this.updatedAt = Date.now();
  // Set initial current balance if not set
  if (this.isNew && this.currentBalance === 0) {
    this.currentBalance = this.initialBalance;
  }
});

module.exports = mongoose.model('CashMember', cashMemberSchema);
