const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Insurance Type
  insuranceType: {
    type: String,
    enum: ['life', 'health', 'general'],
    required: true,
  },
  
  // Customer & Company Details
  customerName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  policyName: {
    type: String,
    required: true,
  },
  policyNumber: {
    type: String,
    required: true,
    unique: true,
  },
  policyType: {
    type: String,
    required: true,
    // Flexible enum to support General Insurance types as well
    enum: [
      'term', 'whole-life', 'endowment', 'ulip', 'money-back', // Life
      'health', 'critical-illness', 'family-floater', 'individual', // Health
      'motor', 'travel', 'fire', 'marine', 'liability', 'other' // General
    ],
  },
  policyCategory: {
    type: String,
    enum: ['New', 'Renewal'],
  },
  
  // Dates
  purchaseDate: {
    type: Date,
    required: true,
  },
  policyStartDate: {
    type: Date,
  },
  policyEndDate: {
    type: Date,
  },
  maturityDate: {
    type: Date, // Mainly for life insurance
  },
  
  // Premium Details
  policyTerm: {
    type: String, // e.g., "1 Year", "Multi-year"
  },
  premiumPaymentMode: {
    type: String,
    enum: ['monthly', 'quarterly', 'half-yearly', 'yearly', 'single', 'onetime'],
    default: 'yearly',
  },
  premiumDate: {
    type: String, // Day of month like "15th"
  },
  premiumAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  gstAmount: {
    type: Number,
    default: 0,
  },
  totalPremium: {
    type: Number,
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Cheque', 'Online'],
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Paid',
  },
  lastPremiumDate: {
    type: Date,
  },
  
  // Coverage Amounts
  sumAssured: {
    type: Number, // For life insurance
    min: 0,
  },
  sumInsured: {
    type: Number, // For health/general insurance
    min: 0,
  },
  maturityAmount: {
    type: Number, // For life insurance
    min: 0,
  },

  // Additional Fields
  additionalField1: String,
  additionalField2: String,
  additionalField3: String,
  additionalField4: String,
  additionalField5: String,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'lapsed', 'matured', 'surrendered', 'claimed'],
    default: 'active',
  },
  
  // Nominees
  nominees: [{
    name: String,
    relationship: String,
    percentage: Number,
    age: Number,
  }],
  
  // Premium Payment History
  premiumHistory: [{
    paymentDate: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending'
    },
    receiptNumber: String,
  }],
  
  // Claims History
  claimsHistory: [{
    claimDate: Date,
    claimAmount: Number,
    claimStatus: {
      type: String,
      enum: ['submitted', 'under-review', 'approved', 'rejected', 'settled'],
      default: 'submitted'
    },
    claimNumber: String,
    settlementAmount: Number,
    settlementDate: Date,
  }],
  
  // Meta
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

// Virtual for next premium due date
insuranceSchema.virtual('nextPremiumDue').get(function() {
  if (!this.premiumDate || this.status !== 'active') return null;
  
  const today = new Date();
  const day = parseInt(this.premiumDate.replace(/\D/g, ''));
  
  let nextDate = new Date(today.getFullYear(), today.getMonth(), day);
  
  // Adjust based on payment mode
  switch (this.premiumPaymentMode) {
    case 'monthly':
      if (nextDate <= today) {
        nextDate = new Date(today.getFullYear(), today.getMonth() + 1, day);
      }
      break;
    case 'quarterly':
      if (nextDate <= today) {
        nextDate = new Date(today.getFullYear(), today.getMonth() + 3, day);
      }
      break;
    case 'half-yearly':
      if (nextDate <= today) {
        nextDate = new Date(today.getFullYear(), today.getMonth() + 6, day);
      }
      break;
    case 'yearly':
      if (nextDate <= today) {
        nextDate = new Date(today.getFullYear() + 1, today.getMonth(), day);
      }
      break;
    default:
      return null;
  }
  
  return nextDate;
});

// Pre-save middleware
insuranceSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Insurance', insuranceSchema);