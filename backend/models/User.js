const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    trim: true,
    default: null
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    default: null
  },
  subscriptionStatus: {
    type: String,
    enum: ['trial', 'active', 'expired', 'cancelled'],
    default: 'trial'
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  // Storage space management
  totalStorage: {
    type: Number, // in GB
    default: 5 // Default 5GB free storage
  },
  usedStorage: {
    type: Number, // in GB
    default: 0
  },
  purchasedSpacePlans: [{
    spacePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SpacePlan'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date
    },
    storageAdded: {
      type: Number // in GB
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
