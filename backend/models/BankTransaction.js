const mongoose = require('mongoose');

const bankTransactionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank',
    required: true
  },
  type: {
    type: String,
    enum: ['withdrawal', 'deposit', 'transfer', 'payment', 'fee', 'interest'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  merchant: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['traveling', 'school-fees', 'grocery-household', 'utilities', 'healthcare', 'entertainment', 'shopping', 'education', 'salary', 'rent', 'other'],
    default: 'other'
  },
  modeOfTransaction: {
    type: String,
    enum: ['neft', 'rtgs', 'imps', 'upi', 'cheque', 'dd', 'atm', 'debit-card', 'online-transfer', 'cash', 'other'],
    default: 'neft'
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
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY'],
    default: 'INR'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankTransaction', bankTransactionSchema);
