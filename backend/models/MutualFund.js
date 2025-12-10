const mongoose = require('mongoose');

const mutualFundSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  investmentType: {
    type: String,
    enum: ['lumpsum', 'sip'],
    required: true,
  },
  
  // Basic Details
  broker: {
    type: String,
    required: true,
  },
  investorName: {
    type: String,
    required: true,
  },
  fundName: {
    type: String,
    required: true,
  },
  fundType: {
    type: String,
    required: true,
    enum: ['equity', 'debt', 'hybrid', 'index', 'elss', 'other'],
  },
  folioNumber: {
    type: String,
    required: true,
  },
  
  // SIP specific fields
  sipDate: {
    type: String, // Day of month like "15th"
  },
  sipAmount: {
    type: Number,
    min: 0,
  },
  
  // Investment Details
  units: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseNAV: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseValue: {
    type: Number,
    required: true,
    min: 0,
  },
  currentNAV: {
    type: Number,
    default: 0,
  },
  marketValue: {
    type: Number,
    default: 0,
  },
  
  // Calculated Fields
  profit: {
    type: Number,
    default: 0,
  },
  transactionDays: {
    type: Number,
    default: 0,
  },
  annualizedReturn: {
    type: Number,
    default: 0,
  },
  absoluteReturn: {
    type: Number,
    default: 0,
  },
  
  // Status & Pattern
  holdingStatus: {
    type: String,
    enum: ['active', 'redeemed', 'partial'],
    default: 'active',
  },
  holdingPattern: {
    type: String,
    enum: ['single', 'joint', 'minor'],
    default: 'single',
  },
  
  // Dates
  investmentDate: {
    type: Date,
    default: Date.now,
  },
  
  // Meta
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to calculate values
mutualFundSchema.pre('save', function() {
  // Calculate market value
  this.marketValue = this.units * this.currentNAV;
  
  // Calculate profit/loss
  this.profit = this.marketValue - this.purchaseValue;
  
  // Calculate absolute return
  this.absoluteReturn = this.purchaseValue > 0 ? (this.profit / this.purchaseValue) * 100 : 0;
  
  // Calculate transaction days
  if (this.investmentDate) {
    this.transactionDays = Math.floor((Date.now() - this.investmentDate) / (1000 * 60 * 60 * 24));
  }
  
  // Calculate annualized return
  if (this.transactionDays > 0 && this.purchaseValue > 0) {
    const years = this.transactionDays / 365;
    this.annualizedReturn = years > 0 ? (Math.pow(this.marketValue / this.purchaseValue, 1/years) - 1) * 100 : 0;
  }
  
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('MutualFund', mutualFundSchema);