const mongoose = require('mongoose');

const incomeExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'],
  },
  category: {
    type: String,
    required: true,
    enum: [
      // Income categories
      'salary',
      'business',
      'investment',
      'rental',
      'freelance',
      'gift',
      'refund',
      'other-income',
      // Expense categories
      'food',
      'transport',
      'shopping',
      'entertainment',
      'utilities',
      'healthcare',
      'education',
      'rent',
      'insurance',
      'loan-payment',
      'tax',
      'other-expense'
    ],
  },
  subcategory: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  source: {
    type: String,
    required: function() {
      return this.type === 'income';
    },
  },
  paymentMethod: {
    type: String,
    required: function() {
      return this.type === 'expense';
    },
    enum: ['cash', 'card', 'bank-transfer', 'upi', 'wallet', 'other'],
  },
  account: {
    type: String,
    // Reference to cash, card, or bank account
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: function() {
      return this.isRecurring;
    },
  },
  recurringEndDate: {
    type: Date,
  },
  receipt: {
    type: String, // URL to receipt image or document
  },
  attachments: [{
    type: String, // URLs to attachment files
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed',
  },
  taxDeductible: {
    type: Boolean,
    default: false,
  },
  taxCategory: {
    type: String,
    required: function() {
      return this.taxDeductible;
    },
  },
  budgetCategory: {
    type: String,
  },
  notes: {
    type: String,
    trim: true,
  },
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

incomeExpenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (typeof next === 'function') {
    next();
  }
});

// Index for better query performance
incomeExpenseSchema.index({ userId: 1, date: -1 });
incomeExpenseSchema.index({ userId: 1, type: 1, category: 1 });
incomeExpenseSchema.index({ userId: 1, isRecurring: 1 });

module.exports = mongoose.model('IncomeExpense', incomeExpenseSchema);
