const mongoose = require('mongoose');

const profitLossSchema = new mongoose.Schema({
    // User reference for multi-tenancy
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Reference to trading details if auto-generated
    purchaseRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TradingDetails'
    },
    salesRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TradingDetails'
    },

    // Common Information
    modeOfTransaction: {
        type: String,
        enum: ['Intra Day', 'Delivery'],
        required: true
    },
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

    // Purchase Information
    dateOfPurchase: {
        type: Date,
        required: true
    },
    purchaseQuantity: {
        type: Number,
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    purchaseValuation: {
        type: Number // Quantity × Purchase Price
    },
    purchaseCharges: {
        type: Number,
        default: 0
    },
    actualPriceOfPurchase: {
        type: Number // Purchase Price + (Charges/Quantity)
    },
    actualPurchaseValuation: {
        type: Number // Quantity × Actual Price of Purchase
    },

    // Sales Information
    dateOfSales: {
        type: Date,
        required: true
    },
    salesQuantity: {
        type: Number,
        required: true
    },
    salesPrice: {
        type: Number,
        required: true
    },
    salesCharges: {
        type: Number,
        default: 0
    },
    salesValuation: {
        type: Number // Quantity × Sales Price
    },
    actualPriceOfSales: {
        type: Number // Sales Price - (Charges/Quantity)
    },
    actualSalesValuation: {
        type: Number // Quantity × Actual Price of Sales
    },

    // Profit/Loss Calculation
    profitLossValue: {
        type: Number // Actual Sales Valuation - Actual Purchase Valuation
    },
    profitLossPercentage: {
        type: Number // (P/L Value / Actual Purchase Valuation) × 100
    },

    // Annualized P/L (for SIP/regular investments)
    holdingDays: {
        type: Number // Days between purchase and sale
    },
    annualisedProfitLossValue: {
        type: Number // (P/L Value / Actual Purchase Valuation) × (365 / Holding Days) × Actual Purchase Valuation
    },
    annualisedProfitLossPercentage: {
        type: Number // (P/L Value / Actual Purchase Valuation) × (365 / Holding Days) × 100
    },

    // Status
    status: {
        type: String,
        enum: ['Active', 'Closed', 'Partial'],
        default: 'Closed'
    }
}, {
    timestamps: true
});

// Pre-save hook to calculate all derived fields
profitLossSchema.pre('save', async function () {
    // Purchase Calculations
    if (this.purchaseQuantity && this.purchasePrice) {
        this.purchaseValuation = this.purchaseQuantity * this.purchasePrice;
    }

    if (this.purchasePrice && this.purchaseQuantity && this.purchaseCharges !== undefined) {
        const chargesPerUnit = this.purchaseCharges / this.purchaseQuantity;
        this.actualPriceOfPurchase = this.purchasePrice + chargesPerUnit;
    }

    if (this.purchaseQuantity && this.actualPriceOfPurchase) {
        this.actualPurchaseValuation = this.purchaseQuantity * this.actualPriceOfPurchase;
    }

    // Sales Calculations
    if (this.salesQuantity && this.salesPrice) {
        this.salesValuation = this.salesQuantity * this.salesPrice;
    }

    if (this.salesPrice && this.salesQuantity && this.salesCharges !== undefined) {
        const chargesPerUnit = this.salesCharges / this.salesQuantity;
        this.actualPriceOfSales = this.salesPrice - chargesPerUnit;
    }

    if (this.salesQuantity && this.actualPriceOfSales) {
        this.actualSalesValuation = this.salesQuantity * this.actualPriceOfSales;
    }

    // Profit/Loss Calculations
    if (this.actualSalesValuation && this.actualPurchaseValuation) {
        this.profitLossValue = this.actualSalesValuation - this.actualPurchaseValuation;
        
        if (this.actualPurchaseValuation !== 0) {
            this.profitLossPercentage = (this.profitLossValue / this.actualPurchaseValuation) * 100;
        }
    }

    // Annualized P/L Calculations
    if (this.dateOfPurchase && this.dateOfSales) {
        const timeDiff = new Date(this.dateOfSales) - new Date(this.dateOfPurchase);
        this.holdingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (this.holdingDays > 0 && this.actualPurchaseValuation && this.profitLossValue) {
            const annualisedReturn = (this.profitLossValue / this.actualPurchaseValuation) * (365 / this.holdingDays);
            this.annualisedProfitLossPercentage = annualisedReturn * 100;
            this.annualisedProfitLossValue = annualisedReturn * this.actualPurchaseValuation;
        }
    }
});

// Index for efficient queries
profitLossSchema.index({ userId: 1, nameOfScript: 1 });
profitLossSchema.index({ userId: 1, dateOfSales: -1 });

module.exports = mongoose.model('ProfitLoss', profitLossSchema);
