const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'nps-ppf',
      'gold-sgb',
      'bank-schemes',
      'mf-insurance',
      'valuation',
      'project-wise',
      'profile',
      'loan-amortization',
      'retirement',
      // Family static data categories
      'static-online-access',
      'static-mobile-email',
      'static-personal-records',
      'static-digital-assets',
      'static-family-profile'
      , 'static-inventory-record'
      , 'static-contact-management'
    ],
  },
  type: {
    type: String,
    required: true, // e.g., NPS, PPF, Digital Gold, SGB, Physical Gold, etc.
  },
  name: {
    type: String,
    required: true,
  },
  // Gold/SGB specific fields
  provider: String, // e.g., MMTC-PAMP, RBI, HDFC Securities
  quantity: Number, // for gold/silver in grams, for bonds in units
  purchasePrice: Number, // price per unit
  currentValue: Number, // current market price per unit
  
  // Generic fields
  accountNumber: String,
  amount: Number, // total amount (quantity * purchasePrice)
  startDate: {
    type: Date,
    required: true,
  },
  maturityDate: Date,
  interestRate: Number,
  frequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'one-time'],
    default: 'one-time',
  },
  
  // Gold/SGB specific fields
  purity: String, // 24K, 22K, Silver, etc.
  storageType: {
    type: String,
    enum: ['digital', 'physical', 'bank-locker', 'vault', 'demat'],
    default: 'digital',
  },
  
  // Calculated fields
  returns: Number,
  returnsPercentage: Number,
  
  // Generic fields
  notes: String,
  documents: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Temporarily remove pre-save middleware to test
// investmentSchema.pre('save', function(next) {
//   try {
//     // Calculate total amount if quantity and purchasePrice are provided
//     if (this.quantity && this.purchasePrice) {
//       this.amount = this.quantity * this.purchasePrice;
//     }
    
//     // Calculate returns if currentValue is provided
//     if (this.currentValue && this.quantity) {
//       const currentTotal = this.quantity * this.currentValue;
//       this.returns = currentTotal - this.amount;
//       this.returnsPercentage = this.amount > 0 ? (this.returns / this.amount) * 100 : 0;
//     }
    
//     this.updatedAt = Date.now();
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = mongoose.model('Investment', investmentSchema);
