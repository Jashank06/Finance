const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  itemCost: { type: Number, required: true },
  itemType: { type: String, default: 'purchase' }
});

const savingsItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  itemAmount: { type: Number, required: true },
  itemType: { type: String, default: 'savings' }
});

const targetSchema = new mongoose.Schema({
  totalSavingsTarget: { type: Number, required: true },
  targetDescription: { type: String, required: true },
  purchases: [purchaseItemSchema],
  savings: [savingsItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
targetSchema.pre('save', function() {
  this.updatedAt = new Date();
  return Promise.resolve();
});

const Target = mongoose.model('Target', targetSchema);
module.exports = Target;
