const express = require('express');
const router = express.Router();
const ProfitLoss = require('../models/ProfitLoss');
const TradingDetails = require('../models/TradingDetails');
const auth = require('../middleware/auth');

// Get all P&L records for logged-in user
router.get('/', auth, async (req, res) => {
    try {
        console.log('[Profit Loss] Fetching records for user:', req.user.id);
        const profitLossRecords = await ProfitLoss.find({ userId: req.user.id })
            .sort({ dateOfSales: -1 });

        console.log(`[Profit Loss] Found ${profitLossRecords.length} records`);
        res.json({
            success: true,
            data: profitLossRecords
        });
    } catch (error) {
        console.error('[Profit Loss] Error fetching records:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching P&L records',
            error: error.message
        });
    }
});

// Get single P&L record by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const record = await ProfitLoss.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'P&L record not found'
            });
        }

        res.json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error('Error fetching P&L record:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching P&L record',
            error: error.message
        });
    }
});

// Auto-generate P&L records from Trading Details
router.post('/auto-generate', auth, async (req, res) => {
    try {
        // Get all purchase and sale transactions
        const purchases = await TradingDetails.find({
            userId: req.user.id,
            typeOfTransaction: 'Purchase'
        });

        const sales = await TradingDetails.find({
            userId: req.user.id,
            typeOfTransaction: 'Sell'
        });

        console.log(`Found ${purchases.length} purchases and ${sales.length} sales for user ${req.user.id}`);

        const generatedRecords = [];
        const matchedSales = new Set();

        // Helper function for case-insensitive comparison
        const normalizeString = (str) => {
            return str ? str.toString().trim().toLowerCase() : '';
        };

        // Match purchases with sales based on script name, investor, and trading ID
        for (const sale of sales) {
            // Find matching purchase with flexible matching
            const matchingPurchases = purchases.filter(p => {
                const scriptMatch = normalizeString(p.nameOfScript) === normalizeString(sale.nameOfScript);
                const investorMatch = normalizeString(p.nameOfInvestor) === normalizeString(sale.nameOfInvestor);
                const tradingIdMatch = normalizeString(p.tradingId) === normalizeString(sale.tradingId);

                // Date comparison - ensure purchase is before sale
                let dateMatch = true;
                if (p.dateOfPurchase && sale.dateOfSale) {
                    dateMatch = new Date(p.dateOfPurchase) <= new Date(sale.dateOfSale);
                }

                return scriptMatch && investorMatch && tradingIdMatch && dateMatch;
            });

            if (matchingPurchases.length > 0) {
                // Use the earliest purchase that hasn't been matched yet
                const matchingPurchase = matchingPurchases.find(p =>
                    !generatedRecords.some(r => r.purchaseRecordId && r.purchaseRecordId.equals(p._id))
                ) || matchingPurchases[0];

                // Check if P&L record already exists for this combination
                const existingRecord = await ProfitLoss.findOne({
                    userId: req.user.id,
                    purchaseRecordId: matchingPurchase._id,
                    salesRecordId: sale._id
                });

                if (!existingRecord) {
                    // Calculate total charges from purchase
                    const purchaseCharges = (matchingPurchase.charges1 || 0) +
                        (matchingPurchase.charges2 || 0) +
                        (matchingPurchase.charges3 || 0) +
                        (matchingPurchase.charges4 || 0) +
                        (matchingPurchase.charges5 || 0);

                    // Calculate total charges from sale
                    const salesCharges = (sale.charges1 || 0) +
                        (sale.charges2 || 0) +
                        (sale.charges3 || 0) +
                        (sale.charges4 || 0) +
                        (sale.charges5 || 0);

                    // Create P&L record
                    const plRecord = new ProfitLoss({
                        userId: req.user.id,
                        purchaseRecordId: matchingPurchase._id,
                        salesRecordId: sale._id,
                        modeOfTransaction: matchingPurchase.modeOfTransaction,
                        dematCompany: matchingPurchase.dematCompany,
                        modeOfHolding: matchingPurchase.modeOfHolding,
                        nameOfInvestor: matchingPurchase.nameOfInvestor,
                        tradingId: matchingPurchase.tradingId,
                        nameOfScript: matchingPurchase.nameOfScript,
                        dateOfPurchase: matchingPurchase.dateOfPurchase,
                        purchaseQuantity: matchingPurchase.quantity,
                        purchasePrice: matchingPurchase.purchasePrice,
                        purchaseCharges: purchaseCharges,
                        dateOfSales: sale.dateOfSale,
                        salesQuantity: sale.quantity,
                        salesPrice: sale.salePrice,
                        salesCharges: salesCharges
                    });

                    await plRecord.save();
                    generatedRecords.push(plRecord);
                    matchedSales.add(sale._id.toString());

                    console.log(`Created P&L record for ${matchingPurchase.nameOfScript}`);
                }
            } else {
                console.log(`No matching purchase found for sale: ${sale.nameOfScript} (Investor: ${sale.nameOfInvestor}, Trading ID: ${sale.tradingId})`);
            }
        }

        // Log summary
        console.log(`Generated ${generatedRecords.length} P&L records`);
        console.log(`Unmatched sales: ${sales.length - matchedSales.size}`);

        res.json({
            success: true,
            message: `Generated ${generatedRecords.length} P&L records from ${purchases.length} purchases and ${sales.length} sales`,
            data: generatedRecords,
            stats: {
                totalPurchases: purchases.length,
                totalSales: sales.length,
                matched: generatedRecords.length,
                unmatchedSales: sales.length - matchedSales.size
            }
        });
    } catch (error) {
        console.error('Error auto-generating P&L records:', error);
        res.status(500).json({
            success: false,
            message: 'Error auto-generating P&L records',
            error: error.message
        });
    }
});

// Create new P&L record manually
router.post('/', auth, async (req, res) => {
    try {
        const recordData = {
            ...req.body,
            userId: req.user.id
        };

        const record = new ProfitLoss(recordData);
        await record.save();

        res.status(201).json({
            success: true,
            message: 'P&L record created successfully',
            data: record
        });
    } catch (error) {
        console.error('Error creating P&L record:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating P&L record',
            error: error.message
        });
    }
});

// Update P&L record
router.put('/:id', auth, async (req, res) => {
    try {
        const record = await ProfitLoss.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'P&L record not found'
            });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key !== 'userId') {
                record[key] = req.body[key];
            }
        });

        await record.save();

        res.json({
            success: true,
            message: 'P&L record updated successfully',
            data: record
        });
    } catch (error) {
        console.error('Error updating P&L record:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating P&L record',
            error: error.message
        });
    }
});

// Delete P&L record
router.delete('/:id', auth, async (req, res) => {
    try {
        const record = await ProfitLoss.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'P&L record not found'
            });
        }

        res.json({
            success: true,
            message: 'P&L record deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting P&L record:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting P&L record',
            error: error.message
        });
    }
});

// Get P&L summary/statistics
router.get('/stats/summary', auth, async (req, res) => {
    try {
        console.log('[Profit Loss] Fetching summary for user:', req.user.id);
        const records = await ProfitLoss.find({ userId: req.user.id });

        const summary = {
            totalTrades: records.length,
            totalProfitLoss: records.reduce((sum, r) => sum + (r.profitLossValue || 0), 0),
            totalPurchaseValue: records.reduce((sum, r) => sum + (r.actualPurchaseValuation || 0), 0),
            totalSalesValue: records.reduce((sum, r) => sum + (r.actualSalesValuation || 0), 0),
            profitableTrades: records.filter(r => r.profitLossValue > 0).length,
            losingTrades: records.filter(r => r.profitLossValue < 0).length,
            avgProfitLossPercentage: records.length > 0
                ? records.reduce((sum, r) => sum + (r.profitLossPercentage || 0), 0) / records.length
                : 0
        };

        console.log('[Profit Loss] Summary calculated:', summary);
        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('[Profit Loss] Error fetching summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching P&L summary',
            error: error.message
        });
    }
});

module.exports = router;
