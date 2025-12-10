const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Broker & Account Details
  broker: {
    type: String,
    required: true,
  },
  purchaseType: {
    type: String,
    enum: ['delivery', 'intraday', 'btst', 'stbt'],
    default: 'delivery',
  },
  clientId: {
    type: String,
    required: true,
  },
  dpId: {
    type: String,
    required: true,
  },
  tradingId: {
    type: String,
    required: true,
  },
  
  // Investor Details
  investorName: {
    type: String,
    required: true,
  },
  scripName: {
    type: String,
    required: true,
  },
  
  // Purchase Details
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Charges
  brokerage: {
    type: Number,
    default: 0,
  },
  stt: {
    type: Number,
    default: 0,
  },
  otherCharges: {
    type: Number,
    default: 0,
  },
  totalCharges: {
    type: Number,
    default: 0,
  },
  
  // Investment Amount
  purchaseAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  
  // Current Valuation
  currentPrice: {
    type: Number,
    default: 0,
  },
  currentValuation: {
    type: Number,
    default: 0,
  },
  
  // Performance Metrics
  cagr: {
    type: Number,
    default: 0,
  },
  absoluteReturn: {
    type: Number,
    default: 0,
  },
  unrealisedPL: {
    type: Number,
    default: 0,
  },
  scripHolding: {
    type: Number,
    default: 0, // Percentage of total portfolio
  },
  
  // Additional Details
  nominee: {
    type: String,
    default: '',
  },
  intraDay: {
    type: Boolean,
    default: false,
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
shareSchema.pre('save', function() {
  // Calculate total charges
  this.totalCharges = this.brokerage + this.stt + this.otherCharges;
  
  // Calculate current valuation
  this.currentValuation = this.quantity * this.currentPrice;
  
  // Calculate unrealised P&L
  this.unrealisedPL = this.currentValuation - (this.purchaseAmount + this.totalCharges);
  
  // Calculate absolute return
  const totalCost = this.purchaseAmount + this.totalCharges;
  this.absoluteReturn = totalCost > 0 ? (this.unrealisedPL / totalCost) * 100 : 0;
  
  // Calculate CAGR
  if (this.purchaseDate && totalCost > 0) {
    const years = (Date.now() - this.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
    if (years > 0) {
      this.cagr = (Math.pow(this.currentValuation / totalCost, 1/years) - 1) * 100;
    }
  }
  
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Share', shareSchema);