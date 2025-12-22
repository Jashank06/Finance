const mongoose = require('mongoose');

const tradingDetailsSchema = new mongoose.Schema({
    // User reference for multi-tenancy
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Transaction metadata
    modeOfTransaction: {
        type: String,
        enum: ['Intra Day', 'Delivery'],
        required: true
    },
    typeOfTransaction: {
        type: String,
        enum: ['Purchase', 'Sell'],
        required: true
    },

    // Common fields
    dematCompany: {
        type: String,
        required: true
    },
    modeOfHolding: {
        type: String,
        required: true
    },
    nameOfInvestor: {
        type: String,
        required: true
    },
    tradingId: {
        type: String,
        required: true
    },
    nameOfScript: {
        type: String,
        required: true
    },

    // Purchase-specific fields
    dateOfPurchase: {
        type: Date
    },
    quantity: {
        type: Number
    },
    purchasePrice: {
        type: Number
    },
    charges1: {
        type: Number,
        default: 0
    },
    charges2: {
        type: Number,
        default: 0
    },
    charges3: {
        type: Number,
        default: 0
    },
    charges4: {
        type: Number,
        default: 0
    },
    charges5: {
        type: Number,
        default: 0
    },
    purchaseValuation: {
        type: Number
    },
    actualPriceOfPurchase: {
        type: Number
    },
    actualValuation: {
        type: Number
    },
    profitLoss: {
        type: Number
    },
    annualisedProfitLoss: {
        type: Number
    },
    value: {
        type: Number
    },

    // Sell-specific fields
    dateOfSale: {
        type: Date
    },
    salePrice: {
        type: Number
    },
    salesValuation: {
        type: Number
    },
    actualPriceOfSales: {
        type: Number
    }
    // actualValuation is shared between Purchase and Sell
}, {
    timestamps: true
});

// Pre-save hook to calculate derived fields
tradingDetailsSchema.pre('save', async function () {
    if (this.typeOfTransaction === 'Purchase') {
        // Calculate Purchase Valuation = Quantity × Purchase Price
        if (this.quantity && this.purchasePrice) {
            this.purchaseValuation = this.quantity * this.purchasePrice;
        }

        // Calculate Actual Price of Purchase = Purchase Price + All Charges
        if (this.purchasePrice !== undefined) {
            const totalCharges = (this.charges1 || 0) + (this.charges2 || 0) +
                (this.charges3 || 0) + (this.charges4 || 0) +
                (this.charges5 || 0);
            this.actualPriceOfPurchase = this.purchasePrice + totalCharges;
        }

        // Calculate Actual Valuation = Quantity × Actual Price of Purchase
        if (this.quantity && this.actualPriceOfPurchase) {
            this.actualValuation = this.quantity * this.actualPriceOfPurchase;
        }
    } else if (this.typeOfTransaction === 'Sell') {
        // Calculate Sales Valuation = Quantity × Sale Price
        if (this.quantity && this.salePrice) {
            this.salesValuation = this.quantity * this.salePrice;
        }

        // Calculate Actual Price of Sales = Sale Price - All Charges
        if (this.salePrice !== undefined) {
            const totalCharges = (this.charges1 || 0) + (this.charges2 || 0) +
                (this.charges3 || 0) + (this.charges4 || 0) +
                (this.charges5 || 0);
            this.actualPriceOfSales = this.salePrice - totalCharges;
        }

        // Calculate Actual Valuation = Quantity × Actual Price of Sales
        if (this.quantity && this.actualPriceOfSales) {
            this.actualValuation = this.quantity * this.actualPriceOfSales;
        }
    }
});

module.exports = mongoose.model('TradingDetails', tradingDetailsSchema);
