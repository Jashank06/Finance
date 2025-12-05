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
    enum: ['food', 'shopping', 'transport', 'entertainment', 'utilities', 'healthcare', 'education', 'salary', 'rent', 'other'],
    default: 'other'
  },
  description: {
    type: String
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
