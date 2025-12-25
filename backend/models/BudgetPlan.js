const mongoose = require('mongoose');

const budgetPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    selectedPlan: {
        type: String,
        required: true,
        enum: ['bare_minimum', 'most_popular', 'standard', 'stable', 'good']
    },
    monthlyIncome: {
        type: Number,
        required: true,
        min: 0
    },
    planDetails: {
        name: String,
        allocations: {
            needs: Number,
            wants: Number,
            savings: Number,
            investment: Number,
            survivalBuffer: Number
        },
        categoryMappings: {
            needs: [String],
            wants: [String],
            savings: [String],
            investment: [String],
            survivalBuffer: [String]
        }
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
budgetPlanSchema.pre('save', function () {
    this.updatedAt = new Date();
    return Promise.resolve();
});

// Static method to get plan details by plan type
budgetPlanSchema.statics.getPlanDetails = function (planType) {
    const plans = {
        bare_minimum: {
            name: 'Bare Minimum',
            allocations: {
                needs: 80,
                survivalBuffer: 20,
                wants: 0,
                savings: 0,
                investment: 0
            },
            categoryMappings: {
                needs: ['Fixed & Contractual Costs', 'Variable Living Expenses'],
                survivalBuffer: ['Financial Protection & Security'],
                wants: [],
                savings: [],
                investment: []
            }
        },
        most_popular: {
            name: 'Most Popular (50-30-20)',
            allocations: {
                needs: 50,
                wants: 30,
                savings: 20,
                survivalBuffer: 0,
                investment: 0
            },
            categoryMappings: {
                needs: ['Fixed & Contractual Costs', 'Variable Living Expenses'],
                wants: ['Financial Protection & Security', 'Long-Term Savings & Investments'],
                savings: ['Discretionary & Lifestyle'],
                survivalBuffer: [],
                investment: []
            }
        },
        standard: {
            name: 'Standard (40-30-30)',
            allocations: {
                needs: 40,
                wants: 30,
                savings: 30,
                survivalBuffer: 0,
                investment: 0
            },
            categoryMappings: {
                needs: ['Fixed & Contractual Costs', 'Variable Living Expenses'],
                wants: ['Financial Protection & Security', 'Long-Term Savings & Investments'],
                savings: ['Discretionary & Lifestyle', 'Periodic & Large Expenses'],
                survivalBuffer: [],
                investment: []
            }
        },
        stable: {
            name: 'Stable (60-30-10)',
            allocations: {
                needs: 60,
                wants: 30,
                savings: 10,
                survivalBuffer: 0,
                investment: 0
            },
            categoryMappings: {
                needs: ['Fixed & Contractual Costs', 'Variable Living Expenses'],
                wants: ['Financial Protection & Security', 'Long-Term Savings & Investments', 'Periodic & Large Expenses'],
                savings: ['Discretionary & Lifestyle'],
                survivalBuffer: [],
                investment: []
            }
        },
        good: {
            name: 'Good (60-20-10-10)',
            allocations: {
                needs: 60,
                wants: 20,
                investment: 10,
                savings: 10,
                survivalBuffer: 0
            },
            categoryMappings: {
                needs: ['Fixed & Contractual Costs', 'Variable Living Expenses'],
                wants: ['Financial Protection & Security', 'Long-Term Savings & Investments'],
                investment: ['Discretionary & Lifestyle'],
                savings: ['Periodic & Large Expenses'],
                survivalBuffer: []
            }
        }
    };

    return plans[planType] || null;
};

const BudgetPlan = mongoose.model('BudgetPlan', budgetPlanSchema);
module.exports = BudgetPlan;
