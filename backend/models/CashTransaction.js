const mongoose = require('mongoose');

const cashTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CashMember',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income', 'transfer'],
    default: 'expense',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ['traveling', 'school-fees', 'grocery-household', 'utilities', 'healthcare', 'entertainment', 'shopping', 'education', 'other'],
    default: 'other',
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  transactionType: {
    type: String,
    enum: ['expense', 'transfer', 'loan-give', 'loan-take', 'udhar-give', 'udhar-receive', 'on-behalf-in', 'on-behalf-out'],
  },
  modeOfTransaction: {
    type: String,
    enum: ['cash', 'credit-card', 'debit-card', 'upi', 'neft', 'rtgs', 'imps', 'cheque', 'dd', 'other'],
    default: 'cash',
  },
  expenseType: {
    type: String,
    enum: ['important-necessary', 'less-important', 'avoidable-loss', 'unnecessary', 'basic-necessity'],
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'digital-wallet', 'other'],
    default: 'cash',
  },
  location: String,
  notes: String,
  narration: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cashTransactionSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('CashTransaction', cashTransactionSchema);
