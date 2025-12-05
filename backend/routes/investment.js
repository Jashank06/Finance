const express = require('express');
const Investment = require('../models/Investment');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all investments for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category } = req.query;
    const query = { userId: req.userId };
    
    if (category) {
      query.category = category;
    }

    const investments = await Investment.find(query).sort({ createdAt: -1 });
    res.json({ investments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investments', error: error.message });
  }
});

// Get single investment
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    res.json({ investment });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investment', error: error.message });
  }
});

// Create new investment
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('Creating investment with data:', req.body);
    console.log('User ID:', req.userId);
    
    // Normalize incoming fields across categories
    const investmentData = {
      ...req.body,
      userId: req.userId,
    };

    // Map purchaseDate to startDate for consistency
    if (investmentData.purchaseDate) {
      investmentData.startDate = investmentData.purchaseDate;
      delete investmentData.purchaseDate;
    }
    
    // Map bankName to provider for bank-schemes
    if (investmentData.bankName && !investmentData.provider) {
      investmentData.provider = investmentData.bankName;
    }

    // Calculate amount if quantity and purchasePrice are provided
    if (investmentData.quantity && investmentData.purchasePrice) {
      investmentData.amount = investmentData.quantity * investmentData.purchasePrice;
    }

    // Calculate returns for quantity-based and amount-based investments
    if (investmentData.currentValue) {
      if (investmentData.quantity && investmentData.amount) {
        const currentTotal = investmentData.quantity * investmentData.currentValue;
        investmentData.returns = currentTotal - investmentData.amount;
        investmentData.returnsPercentage = investmentData.amount > 0 ? (investmentData.returns / investmentData.amount * 100) : 0;
      } else if (typeof investmentData.amount === 'number') {
        investmentData.returns = investmentData.currentValue - investmentData.amount;
        investmentData.returnsPercentage = investmentData.amount > 0 ? (investmentData.returns / investmentData.amount * 100) : 0;
      }
    }
    
    const investment = new Investment(investmentData);
    await investment.save();
    
    res.status(201).json({
      message: 'Investment created successfully',
      investment,
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ message: 'Error creating investment', error: error.message });
  }
});

// Update investment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Normalize incoming fields across categories
    const updateData = { ...req.body };
    
    // Map purchaseDate to startDate for consistency
    if (updateData.purchaseDate) {
      updateData.startDate = updateData.purchaseDate;
      delete updateData.purchaseDate;
    }
    
    // Map bankName to provider for bank-schemes
    if (updateData.bankName && !updateData.provider) {
      updateData.provider = updateData.bankName;
    }
    
    // Calculate amount if quantity and purchasePrice are provided
    if (updateData.quantity && updateData.purchasePrice) {
      updateData.amount = updateData.quantity * updateData.purchasePrice;
    }
    
    // Calculate returns for quantity-based and amount-based investments
    if (updateData.currentValue) {
      if (updateData.quantity && updateData.amount) {
        const currentTotal = updateData.quantity * updateData.currentValue;
        updateData.returns = currentTotal - updateData.amount;
        updateData.returnsPercentage = updateData.amount > 0 ? (updateData.returns / updateData.amount * 100) : 0;
      } else if (typeof updateData.amount === 'number') {
        updateData.returns = updateData.currentValue - updateData.amount;
        updateData.returnsPercentage = updateData.amount > 0 ? (updateData.returns / updateData.amount * 100) : 0;
      }
    }
    
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    );
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    res.json({
      message: 'Investment updated successfully',
      investment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating investment', error: error.message });
  }
});

// Delete investment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting investment', error: error.message });
  }
});

// Get investment statistics
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.userId });
    
    const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
    const totalReturns = totalCurrentValue - totalInvestment;
    
    const categoryWise = investments.reduce((acc, inv) => {
      if (!acc[inv.category]) {
        acc[inv.category] = { count: 0, amount: 0 };
      }
      acc[inv.category].count += 1;
      acc[inv.category].amount += inv.amount;
      return acc;
    }, {});
    
    res.json({
      totalInvestment,
      totalCurrentValue,
      totalReturns,
      returnsPercentage: totalInvestment > 0 ? ((totalReturns / totalInvestment) * 100).toFixed(2) : 0,
      totalCount: investments.length,
      categoryWise,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Gold/SGB specific routes

// Get gold market prices (mock data for now)
router.get('/gold-sgb/prices', authMiddleware, async (req, res) => {
  try {
    // Mock gold prices - in real app, this would fetch from actual API
    const prices = {
      'Digital Gold': { price: 5800, change: +50, changePercent: 0.87 },
      'Physical Gold 24K': { price: 5850, change: +75, changePercent: 1.30 },
      'SGB': { price: 5900, change: +100, changePercent: 1.72 },
      'Silver': { price: 72000, change: +500, changePercent: 0.70 },
    };
    
    res.json({ prices, lastUpdated: new Date() });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gold prices', error: error.message });
  }
});

// Get gold/sgb investment analytics
router.get('/gold-sgb/analytics', authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ 
      userId: req.userId, 
      category: 'gold-sgb' 
    });
    
    // Calculate analytics
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + (inv.currentValue * inv.quantity || inv.amount), 0);
    const totalReturns = totalCurrent - totalInvested;
    
    // Type-wise distribution
    const typeDistribution = investments.reduce((acc, inv) => {
      if (!acc[inv.type]) {
        acc[inv.type] = { count: 0, invested: 0, current: 0, quantity: 0 };
      }
      acc[inv.type].count += 1;
      acc[inv.type].invested += inv.amount;
      acc[inv.type].current += inv.currentValue * inv.quantity || inv.amount;
      acc[inv.type].quantity += inv.quantity || 0;
      return acc;
    }, {});
    
    // Provider-wise distribution
    const providerDistribution = investments.reduce((acc, inv) => {
      if (!acc[inv.provider]) {
        acc[inv.provider] = { count: 0, invested: 0, current: 0, quantity: 0 };
      }
      acc[inv.provider].count += 1;
      acc[inv.provider].invested += inv.amount;
      acc[inv.provider].current += inv.currentValue * inv.quantity || inv.amount;
      acc[inv.provider].quantity += inv.quantity || 0;
      return acc;
    }, {});
    
    // Storage type distribution
    const storageDistribution = investments.reduce((acc, inv) => {
      if (!acc[inv.storageType]) {
        acc[inv.storageType] = { count: 0, invested: 0, quantity: 0 };
      }
      acc[inv.storageType].count += 1;
      acc[inv.storageType].invested += inv.amount;
      acc[inv.storageType].quantity += inv.quantity || 0;
      return acc;
    }, {});
    
    // Performance data
    const performanceData = investments.map(inv => ({
      name: inv.name,
      type: inv.type,
      provider: inv.provider,
      invested: inv.amount,
      current: inv.currentValue * inv.quantity || inv.amount,
      returns: (inv.currentValue * inv.quantity || inv.amount) - inv.amount,
      returnsPercent: inv.returnsPercentage || 0,
      purchaseDate: inv.startDate,
      quantity: inv.quantity,
      purity: inv.purity,
    }));
    
    res.json({
      summary: {
        totalInvested,
        totalCurrent,
        totalReturns,
        returnsPercentage: totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : 0,
        totalQuantity: investments.reduce((sum, inv) => sum + (inv.quantity || 0), 0),
        totalCount: investments.length,
      },
      typeDistribution,
      providerDistribution,
      storageDistribution,
      performanceData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Update current market prices for all gold/sgb investments
router.put('/gold-sgb/update-prices', authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ 
      userId: req.userId, 
      category: 'gold-sgb' 
    });
    
    // Mock price updates - in real app, fetch from market API
    const priceUpdates = {
      'Digital Gold': 5800,
      'Physical Gold': 5850,
      'SGB': 5900,
      'Silver': 72000,
    };
    
    const updatedInvestments = [];
    
    for (const investment of investments) {
      const newPrice = priceUpdates[investment.type];
      if (newPrice) {
        investment.currentValue = newPrice;
        await investment.save();
        updatedInvestments.push(investment);
      }
    }
    
    res.json({
      message: 'Prices updated successfully',
      updatedCount: updatedInvestments.length,
      investments: updatedInvestments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating prices', error: error.message });
  }
});

// Get SGB maturity alerts
router.get('/gold-sgb/maturity-alerts', authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ 
      userId: req.userId, 
      category: 'gold-sgb',
      type: 'SGB',
      maturityDate: { $exists: true }
    });
    
    const currentDate = new Date();
    const alerts = [];
    
    for (const investment of investments) {
      const maturityDate = new Date(investment.maturityDate);
      const daysToMaturity = Math.ceil((maturityDate - currentDate) / (1000 * 60 * 60 * 24));
      
      if (daysToMaturity <= 365 && daysToMaturity > 0) { // Within 1 year
        alerts.push({
          investmentId: investment._id,
          name: investment.name,
          maturityDate: investment.maturityDate,
          daysToMaturity,
          alertType: daysToMaturity <= 30 ? 'critical' : daysToMaturity <= 90 ? 'warning' : 'info'
        });
      }
    }
    
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maturity alerts', error: error.message });
  }
});

module.exports = router;
