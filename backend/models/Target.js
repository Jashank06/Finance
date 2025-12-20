const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  goalType: { 
    type: String, 
    required: true,
    enum: ['Short Term', 'Long Term', 'Medium Term']
  },
  specificGoal: { 
    type: String, 
    required: true 
  },
  timeHorizon: { 
    type: String, 
    required: true 
  },
  estimatedCost: { 
    type: Number, 
    required: true,
    min: 0
  },
  recommendedInvestmentVehicle: { 
    type: String, 
    required: true 
  },
  riskTolerance: { 
    type: String, 
    required: true,
    enum: ['Very Low', 'Low', 'Low to Medium', 'Medium', 'Medium to High', 'High']
  },
  targetDate: { 
    type: Date, 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
targetSchema.pre('save', function() {
  this.updatedAt = new Date();
  return Promise.resolve();
});

const Target = mongoose.model('Target', targetSchema);
module.exports = Target;
