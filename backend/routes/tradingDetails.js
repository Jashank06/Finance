const express = require('express');
const router = express.Router();
const TradingDetails = require('../models/TradingDetails');
const auth = require('../middleware/auth');
const { autoGeneratePL } = require('../utils/profitLossSync');

// Get all trading details for logged-in user
router.get('/', auth, async (req, res) => {
    try {
        console.log('[Trading Details] Fetching records for user:', req.user.id);
        const tradingDetails = await TradingDetails.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        console.log(`[Trading Details] Found ${tradingDetails.length} records`);
        res.json({
            success: true,
            data: tradingDetails
        });
    } catch (error) {
        console.error('[Trading Details] Error fetching records:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trading details',
            error: error.message
        });
    }
});

// Get single trading detail by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const tradingDetail = await TradingDetails.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!tradingDetail) {
            return res.status(404).json({
                success: false,
                message: 'Trading detail not found'
            });
        }

        res.json({
            success: true,
            data: tradingDetail
        });
    } catch (error) {
        console.error('Error fetching trading detail:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trading detail',
            error: error.message
        });
    }
});

// Create new trading detail
router.post('/', auth, async (req, res) => {
    try {
        console.log('[Trading Details] Creating new record for user:', req.user.id);
        console.log('[Trading Details] Request body:', JSON.stringify(req.body, null, 2));

        const tradingDetailData = {
            ...req.body,
            userId: req.user.id
        };

        const tradingDetail = new TradingDetails(tradingDetailData);
        await tradingDetail.save();

        console.log('[Trading Details] Record created successfully:', tradingDetail._id);

        // Send response first
        res.status(201).json({
            success: true,
            message: 'Trading detail created successfully',
            data: tradingDetail
        });

        // Auto-generate P&L records in background (after response is sent)
        setImmediate(() => {
            autoGeneratePL(req.user.id).catch(err => {
                console.error('[Trading Details] Background P&L sync error:', err);
            });
        });
    } catch (error) {
        console.error('[Trading Details] Error creating record:', error);
        console.error('[Trading Details] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error creating trading detail',
            error: error.message
        });
    }
});

// Update trading detail
router.put('/:id', auth, async (req, res) => {
    try {
        console.log('[Trading Details] Updating record:', req.params.id, 'for user:', req.user.id);

        const tradingDetail = await TradingDetails.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!tradingDetail) {
            return res.status(404).json({
                success: false,
                message: 'Trading detail not found'
            });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key !== 'userId') {
                tradingDetail[key] = req.body[key];
            }
        });

        await tradingDetail.save();
        console.log('[Trading Details] Record updated successfully');

        // Send response first
        res.json({
            success: true,
            message: 'Trading detail updated successfully',
            data: tradingDetail
        });

        // Auto-generate P&L records in background (after response is sent)
        setImmediate(() => {
            autoGeneratePL(req.user.id).catch(err => {
                console.error('[Trading Details] Background P&L sync error:', err);
            });
        });
    } catch (error) {
        console.error('[Trading Details] Error updating record:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating trading detail',
            error: error.message
        });
    }
});

// Delete trading detail
router.delete('/:id', auth, async (req, res) => {
    try {
        const tradingDetail = await TradingDetails.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!tradingDetail) {
            return res.status(404).json({
                success: false,
                message: 'Trading detail not found'
            });
        }

        // Delete associated P&L records
        const ProfitLoss = require('../models/ProfitLoss');
        await ProfitLoss.deleteMany({
            userId: req.user.id,
            $or: [
                { purchaseRecordId: req.params.id },
                { salesRecordId: req.params.id }
            ]
        });
        console.log(`Deleted P&L records associated with trading detail ${req.params.id}`);

        res.json({
            success: true,
            message: 'Trading detail deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting trading detail:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting trading detail',
            error: error.message
        });
    }
});

module.exports = router;
