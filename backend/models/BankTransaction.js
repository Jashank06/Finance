const mongoose = require('mongoose');

const bankTransactionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  merchant: {
    type: String
  },
  category: {
    type: String,
    enum: ['traveling', 'school-fees', 'grocery-household', 'utilities', 'healthcare', 'entertainment', 'shopping', 'education', 'inventory', 'other'],
    default: 'other'
  },
  // Three-level category structure (new)
  broaderCategory: {
    type: String
  },
  mainCategory: {
    type: String
  },
  subCategory: {
    type: String
  },
  customSubCategory: {
    type: String
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
    enum: ['credit', 'debit'],
  },
  narration: {
    type: String
  },
  expenseType: {
    type: String,
    enum: ['important-necessary', 'less-important', 'avoidable-loss', 'unnecessary', 'basic-necessity'],
  },
  // Cross-module payment integration
  payingFor: {
    module: {
      type: String,
      enum: ['loan-ledger', 'project-expense', 'project-income', 'loan-amortization', 'cheque-register', 'daily-cash', 'manage-finance', 'targets', 'bill-dates', 'bill-checklist', 'nps-investments', 'gold-investments', 'rd-fd-deposits', 'retirement-planner']
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId
    },
    referenceName: {
      type: String
    }
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
  // Category-based linking system (replaces checkbox-based linking)
  categoryLink: {
    broaderCategory: {
      type: String,
      enum: ['Loan', 'Udhar Liya', 'Wallet', 'On Behalf']
    },
    mainCategory: {
      type: String // Loan name, Person name, or Wallet name
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId // Link to actual record in Investment or Cash collection
    },
    referenceModule: {
      type: String,
      enum: ['loan-amortization', 'loan-ledger', 'cash', 'on-behalf']
    }
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
