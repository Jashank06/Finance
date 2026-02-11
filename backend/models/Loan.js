const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Debtor & Lender Details
  debtorName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  loanType: {
    type: String,
    required: true,
    enum: ['home-loan', 'personal-loan', 'car-loan', 'education-loan', 'business-loan', 'gold-loan', 'credit-card', 'other'],
  },

  // Loan Timeline
  commencementDate: {
    type: Date,
    required: true,
  },
  closureDate: {
    type: Date,
  },

  // EMI Details
  emiAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  emiDate: {
    type: String, // Day of month like "5th"
    required: true,
  },

  // Loan Amounts
  principalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  interestAmount: {
    type: Number,
    default: 0,
  },
  penalty: {
    type: Number,
    default: 0,
  },
  totalEmi: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    required: true,
    min: 0,
  },
  interestPaid: {
    type: Number,
    default: 0,
  },

  // Loan Terms
  interestRate: {
    type: Number,
    required: true,
    min: 0,
  },
  tenure: {
    type: Number, // in months
    required: true,
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'closed', 'overdue', 'foreclosed'],
    default: 'active',
  },

  // Payment History
  paymentHistory: [{
    paymentDate: Date,
    emiAmount: Number,
    principalPaid: Number,
    interestPaid: Number,
    penalty: Number,
    balanceAfterPayment: Number,
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending'
    }
  }],

  // Amortization Schedule with Payment Tracking
  amortizationSchedule: [{
    paymentNumber: Number,
    date: Date,
    beginningBalance: Number,
    payment: Number,          // Regular EMI amount
    extraPayment: {           // Extra payment beyond EMI
      type: Number,
      default: 0
    },
    principal: Number,
    interest: Number,
    endingBalance: Number,

    // Payment Status Tracking
    paid: {
      type: Boolean,
      default: false
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    paidDate: Date,
    partiallyPaid: {
      type: Boolean,
      default: false
    },

    // Linked Bank Transactions
    linkedTransactions: [{
      transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankTransaction'
      },
      amount: Number,
      date: Date
    }]
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

// Virtual for next EMI due date
loanSchema.virtual('nextEmiDue').get(function () {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Extract day from emiDate (e.g., "5th" -> 5)
  const day = parseInt(this.emiDate.replace(/\D/g, ''));

  let nextEmiDate = new Date(currentYear, currentMonth, day);

  // If the date has passed this month, move to next month
  if (nextEmiDate <= today) {
    nextEmiDate = new Date(currentYear, currentMonth + 1, day);
  }

  return nextEmiDate;
});

// Pre-save middleware to calculate totals
loanSchema.pre('save', function () {
  // Calculate total EMI paid
  this.totalEmi = this.paymentHistory.reduce((sum, payment) => {
    return payment.status === 'paid' ? sum + payment.emiAmount : sum;
  }, 0);

  // Calculate total interest paid
  this.interestPaid = this.paymentHistory.reduce((sum, payment) => {
    return payment.status === 'paid' ? sum + payment.interestPaid : sum;
  }, 0);

  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Loan', loanSchema);