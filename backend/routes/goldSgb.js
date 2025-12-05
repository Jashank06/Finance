const express = require('express');
const GoldSgbController = require('../controllers/goldSgbController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get current market prices
router.get('/prices', authMiddleware, GoldSgbController.getMarketPrices);

// Get comprehensive analytics
router.get('/analytics', authMiddleware, GoldSgbController.getAnalytics);

// Update market prices for investments
router.put('/update-prices', authMiddleware, GoldSgbController.updatePrices);

// Get maturity alerts for SGBs
router.get('/maturity-alerts', authMiddleware, GoldSgbController.getMaturityAlerts);

// Get portfolio health score
router.get('/portfolio-health', authMiddleware, GoldSgbController.getPortfolioHealth);

module.exports = router;
