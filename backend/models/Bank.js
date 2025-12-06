const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['savings', 'current', 'fixed-deposit', 'recurring-deposit', 'nri-account', 'joint-account'],
  },
  name: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  accountHolderName: {
    type: String,
    required: true,
    trim: true,
  },
  // Account details
  currency: {
    type: String,
    required: true,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'OTHER'],
  },
  balance: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  // Fixed/Recurring Deposit specific fields
  depositAmount: {
    type: Number,
    min: 0,
  },
  interestRate: {
    type: Number,
    min: 0,
    max: 100,
  },
  tenure: {
    type: Number,
    min: 1, // in months
  },
  maturityDate: {
    type: Date,
  },
  autoRenewal: {
    type: Boolean,
    default: false,
  },
  // Joint account specific fields
  jointHolders: [{
    name: String,
    relationship: String,
    share: Number, // percentage share
  }],
  // Bank details
  ifscCode: {
    type: String,
    required: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
      },
      message: 'Invalid IFSC code format'
    }
  },
  micrCode: String,
  branchName: {
    type: String,
    required: true,
  },
  branchAddress: String,
  city: String,
  state: String,
  pincode: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v);
      },
      message: 'Pincode must be 6 digits'
    }
  },
  // Online banking
  netBankingEnabled: {
    type: Boolean,
    default: false,
  },
  mobileBankingEnabled: {
    type: Boolean,
    default: false,
  },
  upiEnabled: {
    type: Boolean,
    default: false,
  },
  upiId: String,
  // Nominee details
  nomineeName: String,
  nomineeRelationship: String,
  nomineeAge: Number,
  nomineeContact: String,
  // Common fields
  description: String,
  // New transaction classification fields
  transactionType: {
    type: String,
    enum: ['expense', 'transfer', 'loan-give', 'loan-take', 'on-behalf-in', 'on-behalf-out'],
  },
  expenseType: {
    type: String,
    enum: ['important-necessary', 'less-important', 'avoidable-loss', 'unnecessary', 'basic-necessity'],
  },
  notes: String,
  documents: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  isDormant: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastTransactionDate: Date,
});

bankSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate maturity date for FD/RD
  if ((this.type === 'fixed-deposit' || this.type === 'recurring-deposit') && 
      this.tenure && !this.maturityDate) {
    const maturityDate = new Date(this.createdAt);
    maturityDate.setMonth(maturityDate.getMonth() + this.tenure);
    this.maturityDate = maturityDate;
  }
  
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('Bank', bankSchema);
