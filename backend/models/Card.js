const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['credit-card', 'debit-card', 'prepaid-card', 'gift-card', 'loyalty-card'],
  },
  name: {
    type: String,
    required: true,
  },
  issuer: {
    type: String,
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Basic validation - should be 13-19 digits
        return /^\d{13,19}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Card number must be 13-19 digits'
    }
  },
  cardholderName: {
    type: String,
    required: true,
    trim: true,
  },
  expiryDate: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Format: MM/YY
        return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v);
      },
      message: 'Expiry date must be in MM/YY format'
    }
  },
  cvv: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // CVV should be 3 or 4 digits
        return /^\d{3,4}$/.test(v);
      },
      message: 'CVV must be 3 or 4 digits'
    }
  },
  // Credit card specific fields
  creditLimit: {
    type: Number,
    min: 0,
  },
  availableCredit: {
    type: Number,
    min: 0,
  },
  interestRate: {
    type: Number,
    min: 0,
  },
  minimumPayment: {
    type: Number,
    min: 0,
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'bi-monthly', 'quarterly'],
    default: 'monthly',
  },
  dueDate: {
    type: Number,
    min: 1,
    max: 31,
  },
  // Debit card specific fields
  linkedAccount: {
    type: String,
  },
  bankName: {
    type: String,
  },
  // Common fields
  currency: {
    type: String,
    required: true,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'OTHER'],
  },
  isInternational: {
    type: Boolean,
    default: false,
  },
  contactless: {
    type: Boolean,
    default: false,
  },
  // New transaction classification fields
  transactionType: {
    type: String,
    enum: ['credit', 'debit'],
  },
  expenseType: {
    type: String,
    enum: ['important-necessary', 'less-important', 'avoidable-loss', 'unnecessary', 'basic-necessity'],
  },
  description: String,
  notes: String,
  documents: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  isBlocked: {
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
});

cardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate available credit for credit cards
  if (this.type === 'credit-card' && this.creditLimit && this.minimumPayment) {
    this.availableCredit = this.creditLimit - this.minimumPayment;
  }
  
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('Card', cardSchema);
