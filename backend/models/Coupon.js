const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    default: null // null means applicable to all plans
  },
  maxUses: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minPurchaseAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) return false;
  
  // Check dates
  if (now < this.validFrom || now > this.validUntil) return false;
  
  // Check max uses
  if (this.maxUses && this.usedCount >= this.maxUses) return false;
  
  return true;
};

// Method to apply discount
couponSchema.methods.calculateDiscount = function(amount) {
  if (this.discountType === 'percentage') {
    return amount * (this.discountValue / 100);
  } else {
    return Math.min(this.discountValue, amount);
  }
};

module.exports = mongoose.model('Coupon', couponSchema);
