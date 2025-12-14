const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'payment', 'withdrawal', 'refund', 'fee'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY']
  },
  merchant: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['traveling', 'school-fees', 'grocery-household', 'utilities', 'healthcare', 'entertainment', 'shopping', 'education', 'inventory', 'other']
  },
  modeOfTransaction: {
    type: String,
    enum: ['credit-card', 'debit-card', 'upi', 'neft', 'rtgs', 'imps', 'cheque', 'dd', 'cash', 'other'],
    default: 'credit-card'
  },
  description: {
    type: String
  },
  // New transaction classification fields
  transactionType: {
    type: String,
    enum: ['expense', 'transfer', 'loan-give', 'loan-take', 'udhar-give', 'udhar-receive', 'on-behalf-in', 'on-behalf-out'],
  },
  narration: {
    type: String
  },
  expenseType: {
    type: String,
    enum: ['important-necessary', 'less-important', 'avoidable-loss', 'unnecessary', 'basic-necessity'],
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  referenceNumber: {
    type: String
  },
  tags: [{
    type: String
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
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

transactionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
