const mongoose = require('mongoose');

const sipTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mutualFundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MutualFund',
    required: true,
  },
  folioNumber: {
    type: String,
    required: true,
  },
  fundName: {
    type: String,
    required: true,
  },
  fundType: {
    type: String,
    default: '',
  },
  investorName: {
    type: String,
    default: '',
  },
  broker: {
    type: String,
    default: '',
  },
  isin: {
    type: String,
    default: '',
  },
  // The actual installment date
  installmentDate: {
    type: Date,
    required: true,
  },
  sipAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  // NAV at the time of purchase (on installmentDate)
  purchaseNAV: {
    type: Number,
    required: true,
    min: 0,
  },
  navDate: {
    type: Date,
  },
  // Units = sipAmount / purchaseNAV, rounded to 3 decimal places
  units: {
    type: Number,
    required: true,
    min: 0,
  },
  // Current NAV (auto-fetched / updated)
  currentNAV: {
    type: Number,
    default: 0,
  },
  currentNAVDate: {
    type: Date,
  },
  // Calculated fields
  currentValue: {
    type: Number,
    default: 0,
  },
  transactionDays: {
    type: Number,
    default: 0,
  },
  absoluteReturn: {
    type: Number,
    default: 0,
  },
  annualizedReturn: {
    type: Number,
    default: null,
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

// Pre-save: calculate derived fields
sipTransactionSchema.pre('save', function () {
  if (this.$skipMiddleware) return;

  // Units = SIP Amount / Purchase NAV, 3 decimal precision
  if (this.sipAmount && this.purchaseNAV && this.purchaseNAV > 0) {
    const rawUnits = this.sipAmount / this.purchaseNAV;
    this.units = isNaN(rawUnits) ? 0 : Math.round(rawUnits * 1000) / 1000;
  }

  // Current value = units * currentNAV
  if (this.units != null && this.currentNAV != null) {
    const rawVal = this.units * this.currentNAV;
    this.currentValue = isNaN(rawVal) ? 0 : Math.round(rawVal * 1000) / 1000;
  }

  // Transaction days = days from installmentDate to today
  if (this.installmentDate) {
    this.transactionDays = Math.max(0, Math.floor(
      (Date.now() - new Date(this.installmentDate).getTime()) / (1000 * 60 * 60 * 24)
    ));
  }

  // Absolute return = (currentValue - sipAmount) / sipAmount * 100
  if (this.sipAmount > 0 && this.currentValue != null) {
    const rawAbs = ((this.currentValue - this.sipAmount) / this.sipAmount) * 10000;
    this.absoluteReturn = isNaN(rawAbs) ? 0 : Math.round(rawAbs) / 100;
  }

  // Annualized return
  if (this.transactionDays > 0 && this.sipAmount > 0 && this.currentValue > 0) {
    const years = this.transactionDays / 365;
    if (years > 0) {
      const rawAnn = (Math.pow(this.currentValue / this.sipAmount, 1 / years) - 1) * 10000;
      this.annualizedReturn = isNaN(rawAnn) ? null : Math.round(rawAnn) / 100;
    }
  }

  this.updatedAt = Date.now();
});

module.exports = mongoose.model('SIPTransaction', sipTransactionSchema);
