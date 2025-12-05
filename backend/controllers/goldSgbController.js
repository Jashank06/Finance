const Investment = require('../models/Investment');

class GoldSgbController {
  // Get current market prices for gold/silver
  static async getMarketPrices(req, res) {
    try {
      // Mock data - in production, integrate with real APIs like:
      // - GoldPrice.org API
      // - RBI API for SGB prices
      // - Commodity market APIs
      const prices = {
        'Digital Gold': { 
          price: 5800, 
          change: +50, 
          changePercent: 0.87,
          lastUpdated: new Date(),
          unit: 'per gram'
        },
        'Physical Gold 24K': { 
          price: 5850, 
          change: +75, 
          changePercent: 1.30,
          lastUpdated: new Date(),
          unit: 'per gram'
        },
        'Physical Gold 22K': { 
          price: 5350, 
          change: +68, 
          changePercent: 1.29,
          lastUpdated: new Date(),
          unit: 'per gram'
        },
        'SGB': { 
          price: 5900, 
          change: +100, 
          changePercent: 1.72,
          lastUpdated: new Date(),
          unit: 'per gram'
        },
        'Silver': { 
          price: 72000, 
          change: +500, 
          changePercent: 0.70,
          lastUpdated: new Date(),
          unit: 'per kg'
        },
        'Gold ETF': { 
          price: 5780, 
          change: +45, 
          changePercent: 0.78,
          lastUpdated: new Date(),
          unit: 'per gram'
        },
      };
      
      res.json({ 
        success: true,
        prices,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 60 * 60 * 1000) // Next update in 1 hour
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Error fetching market prices', 
        error: error.message 
      });
    }
  }

  // Get comprehensive analytics for gold/sgb investments
  static async getAnalytics(req, res) {
    try {
      const investments = await Investment.find({ 
        userId: req.userId, 
        category: 'gold-sgb' 
      }).sort({ createdAt: -1 });
      
      if (investments.length === 0) {
        return res.json({
          success: true,
          data: {
            summary: {
              totalInvested: 0,
              totalCurrent: 0,
              totalReturns: 0,
              returnsPercentage: 0,
              totalQuantity: 0,
              totalCount: 0
            },
            typeDistribution: {},
            providerDistribution: {},
            storageDistribution: {},
            performanceData: [],
            monthlyTrends: [],
            recommendations: []
          }
        });
      }
      
      // Calculate summary
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const totalCurrent = investments.reduce((sum, inv) => sum + (inv.currentValue * inv.quantity || inv.amount), 0);
      const totalReturns = totalCurrent - totalInvested;
      const totalQuantity = investments.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
      
      // Type-wise distribution
      const typeDistribution = investments.reduce((acc, inv) => {
        if (!acc[inv.type]) {
          acc[inv.type] = { 
            count: 0, 
            invested: 0, 
            current: 0, 
            quantity: 0,
            returns: 0,
            returnsPercentage: 0
          };
        }
        const currentVal = inv.currentValue * inv.quantity || inv.amount;
        acc[inv.type].count += 1;
        acc[inv.type].invested += inv.amount;
        acc[inv.type].current += currentVal;
        acc[inv.type].quantity += inv.quantity || 0;
        acc[inv.type].returns += currentVal - inv.amount;
        acc[inv.type].returnsPercentage = acc[inv.type].invested > 0 ? 
          ((acc[inv.type].returns / acc[inv.type].invested) * 100) : 0;
        return acc;
      }, {});
      
      // Provider-wise distribution
      const providerDistribution = investments.reduce((acc, inv) => {
        if (!acc[inv.provider]) {
          acc[inv.provider] = { 
            count: 0, 
            invested: 0, 
            current: 0, 
            quantity: 0,
            returns: 0
          };
        }
        const currentVal = inv.currentValue * inv.quantity || inv.amount;
        acc[inv.provider].count += 1;
        acc[inv.provider].invested += inv.amount;
        acc[inv.provider].current += currentVal;
        acc[inv.provider].quantity += inv.quantity || 0;
        acc[inv.provider].returns += currentVal - inv.amount;
        return acc;
      }, {});
      
      // Storage type distribution
      const storageDistribution = investments.reduce((acc, inv) => {
        if (!acc[inv.storageType]) {
          acc[inv.storageType] = { 
            count: 0, 
            invested: 0, 
            quantity: 0,
            percentage: 0
          };
        }
        acc[inv.storageType].count += 1;
        acc[inv.storageType].invested += inv.amount;
        acc[inv.storageType].quantity += inv.quantity || 0;
        acc[inv.storageType].percentage = (acc[inv.storageType].invested / totalInvested * 100).toFixed(2);
        return acc;
      }, {});
      
      // Performance data for charts
      const performanceData = investments.map(inv => {
        const currentVal = inv.currentValue * inv.quantity || inv.amount;
        return {
          name: inv.name.length > 20 ? inv.name.substring(0, 20) + '...' : inv.name,
          type: inv.type,
          provider: inv.provider,
          invested: inv.amount,
          current: currentVal,
          returns: currentVal - inv.amount,
          returnsPercent: inv.amount > 0 ? ((currentVal - inv.amount) / inv.amount * 100) : 0,
          purchaseDate: inv.startDate,
          quantity: inv.quantity || 0,
          purity: inv.purity || 'N/A',
          storageType: inv.storageType || 'digital'
        };
      });
      
      // Monthly trends (mock data - in production, calculate from historical data)
      const monthlyTrends = [
        { month: 'Jan', invested: 50000, current: 52000 },
        { month: 'Feb', invested: 75000, current: 78000 },
        { month: 'Mar', invested: 110000, current: 115000 },
        { month: 'Apr', invested: 135000, current: 142000 },
        { month: 'May', invested: 160000, current: 168000 },
        { month: 'Jun', invested: 185000, current: 195000 },
      ];
      
      // Generate recommendations based on portfolio analysis
      const recommendations = [];
      
      // Diversification recommendation
      const typeCount = Object.keys(typeDistribution).length;
      if (typeCount < 3) {
        recommendations.push({
          type: 'diversification',
          priority: 'medium',
          title: 'Consider Diversifying',
          message: 'You have investments in only ' + typeCount + ' types. Consider adding other gold/silver investment types for better diversification.',
          action: 'Explore SGB, Silver, or Gold ETF options'
        });
      }
      
      // Storage recommendation
      const physicalStorage = storageDistribution['physical']?.invested || 0;
      const totalPhysical = (storageDistribution['physical']?.invested || 0) + (storageDistribution['bank-locker']?.invested || 0);
      if (totalPhysical > 500000) {
        recommendations.push({
          type: 'security',
          priority: 'high',
          title: 'Consider Digital Storage',
          message: 'You have significant physical holdings. Consider digital options for better security and liquidity.',
          action: 'Explore digital gold or secure vault services'
        });
      }
      
      // Performance recommendation
      if (totalReturns < 0) {
        recommendations.push({
          type: 'performance',
          priority: 'high',
          title: 'Review Underperforming Investments',
          message: 'Your portfolio is showing negative returns. Consider reviewing your investment strategy.',
          action: 'Analyze individual investment performance'
        });
      }
      
      res.json({
        success: true,
        data: {
          summary: {
            totalInvested,
            totalCurrent,
            totalReturns,
            returnsPercentage: totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : 0,
            totalQuantity,
            totalCount: investments.length
          },
          typeDistribution,
          providerDistribution,
          storageDistribution,
          performanceData,
          monthlyTrends,
          recommendations
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Error fetching analytics', 
        error: error.message 
      });
    }
  }

  // Update current market prices for all investments
  static async updatePrices(req, res) {
    try {
      const investments = await Investment.find({ 
        userId: req.userId, 
        category: 'gold-sgb' 
      });
      
      // Mock price updates - in production, fetch from real market APIs
      const priceUpdates = {
        'Digital Gold': 5800,
        'Physical Gold': 5850,
        'SGB': 5900,
        'Silver': 72000,
        'Gold ETF': 5780,
      };
      
      const updatedInvestments = [];
      const priceChanges = {};
      
      for (const investment of investments) {
        const newPrice = priceUpdates[investment.type];
        if (newPrice && investment.currentValue !== newPrice) {
          const oldPrice = investment.currentValue || investment.purchasePrice;
          investment.currentValue = newPrice;
          await investment.save();
          
          priceChanges[investment._id] = {
            oldPrice,
            newPrice,
            change: newPrice - oldPrice,
            changePercent: ((newPrice - oldPrice) / oldPrice * 100).toFixed(2)
          };
          
          updatedInvestments.push(investment);
        }
      }
      
      res.json({
        success: true,
        message: 'Prices updated successfully',
        data: {
          updatedCount: updatedInvestments.length,
          investments: updatedInvestments,
          priceChanges,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Error updating prices', 
        error: error.message 
      });
    }
  }

  // Get SGB maturity alerts
  static async getMaturityAlerts(req, res) {
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
          let alertType = 'info';
          if (daysToMaturity <= 30) alertType = 'critical';
          else if (daysToMaturity <= 90) alertType = 'warning';
          
          alerts.push({
            investmentId: investment._id,
            name: investment.name,
            maturityDate: investment.maturityDate,
            daysToMaturity,
            alertType,
            message: `Your SGB "${investment.name}" will mature in ${daysToMaturity} days`
          });
        }
      }
      
      res.json({
        success: true,
        data: {
          alerts: alerts.sort((a, b) => a.daysToMaturity - b.daysToMaturity),
          totalAlerts: alerts.length,
          criticalAlerts: alerts.filter(a => a.alertType === 'critical').length,
          warningAlerts: alerts.filter(a => a.alertType === 'warning').length
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Error fetching maturity alerts', 
        error: error.message 
      });
    }
  }

  // Calculate portfolio health score
  static async getPortfolioHealth(req, res) {
    try {
      const investments = await Investment.find({ 
        userId: req.userId, 
        category: 'gold-sgb' 
      });
      
      if (investments.length === 0) {
        return res.json({
          success: true,
          data: {
            healthScore: 0,
            factors: {
              diversification: 0,
              performance: 0,
              security: 0,
              liquidity: 0
            },
            recommendations: [],
            summary: 'No investments found'
          }
        });
      }
      
      let diversificationScore = 0;
      let performanceScore = 0;
      let securityScore = 0;
      let liquidityScore = 0;
      
      // Calculate diversification score
      const types = new Set(investments.map(inv => inv.type));
      const providers = new Set(investments.map(inv => inv.provider));
      diversificationScore = Math.min((types.size * 20) + (providers.size * 10), 100);
      
      // Calculate performance score
      const totalReturns = investments.reduce((sum, inv) => {
        const current = inv.currentValue * inv.quantity || inv.amount;
        return sum + (current - inv.amount);
      }, 0);
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const returnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested * 100) : 0;
      
      if (returnsPercentage > 10) performanceScore = 100;
      else if (returnsPercentage > 5) performanceScore = 80;
      else if (returnsPercentage > 0) performanceScore = 60;
      else if (returnsPercentage > -5) performanceScore = 40;
      else performanceScore = 20;
      
      // Calculate security score
      const digitalCount = investments.filter(inv => inv.storageType === 'digital').length;
      const physicalCount = investments.filter(inv => inv.storageType === 'physical').length;
      const lockerCount = investments.filter(inv => inv.storageType === 'bank-locker').length;
      
      if (digitalCount > 0) securityScore = 80;
      if (lockerCount > 0) securityScore = Math.max(securityScore, 90);
      if (physicalCount > 0 && digitalCount === 0) securityScore = 40;
      
      // Calculate liquidity score
      const liquidTypes = ['Digital Gold', 'Gold ETF', 'SGB'];
      const liquidInvestments = investments.filter(inv => liquidTypes.includes(inv.type));
      liquidityScore = (liquidInvestments.length / investments.length) * 100;
      
      // Overall health score
      const healthScore = Math.round((diversificationScore + performanceScore + securityScore + liquidityScore) / 4);
      
      // Generate recommendations
      const recommendations = [];
      
      if (diversificationScore < 60) {
        recommendations.push({
          category: 'diversification',
          message: 'Consider diversifying across different investment types and providers'
        });
      }
      
      if (performanceScore < 60) {
        recommendations.push({
          category: 'performance',
          message: 'Review underperforming investments and consider rebalancing'
        });
      }
      
      if (securityScore < 60) {
        recommendations.push({
          category: 'security',
          message: 'Consider moving some physical holdings to digital or bank locker storage'
        });
      }
      
      if (liquidityScore < 60) {
        recommendations.push({
          category: 'liquidity',
          message: 'Consider adding more liquid investment options like digital gold or ETFs'
        });
      }
      
      res.json({
        success: true,
        data: {
          healthScore,
          factors: {
            diversification: Math.round(diversificationScore),
            performance: Math.round(performanceScore),
            security: Math.round(securityScore),
            liquidity: Math.round(liquidityScore)
          },
          recommendations,
          summary: healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor'
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Error calculating portfolio health', 
        error: error.message 
      });
    }
  }
}

module.exports = GoldSgbController;
