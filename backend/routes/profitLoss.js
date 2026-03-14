const express = require('express');
const router = express.Router();
const ProfitLoss = require('../models/ProfitLoss');
const TradingDetails = require('../models/TradingDetails');
const auth = require('../middleware/auth');

// Get all P&L records for logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const section = req.query.section || 'family';
        const query = { userId: req.user.id, section };
        if (req.query.businessId) query.businessId = req.query.businessId;

        const profitLossRecords = await ProfitLoss.find(query)
            .sort({ dateOfSales: -1 });

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
const { autoGeneratePL } = require('../utils/profitLossSync');

router.post('/auto-generate', auth, async (req, res) => {
    try {
        const result = await autoGeneratePL(req.user.id);
        
        const section = req.query.section || 'family';
        const query = { userId: req.user.id, section };
        if (req.query.businessId) query.businessId = req.query.businessId;

        // Fetch the generated records to return them
        const generatedRecords = await ProfitLoss.find(query)
            .sort({ dateOfSales: -1 });

        res.json({
            success: true,
            message: `Successfully synchronized P&L records using FIFO matching.`,
            data: generatedRecords,
            stats: {
                matched: result.created
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
            userId: req.user.id,
            section: req.body.section || 'family',
            businessId: req.body.businessId || null
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
        const section = req.query.section || 'family';
        const query = { userId: req.user.id, section };
        if (req.query.businessId) query.businessId = req.query.businessId;

        const records = await ProfitLoss.find(query);

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
