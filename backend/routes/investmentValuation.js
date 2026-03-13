const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MutualFund = require('../models/MutualFund');
const SIPTransaction = require('../models/SIPTransaction');
const Share = require('../models/Share');
const Insurance = require('../models/Insurance');
const Loan = require('../models/Loan');
const navFetchService = require('../services/navFetchService');
const stockFetchService = require('../services/stockFetchService');

// Summary endpoint - get all investment valuation data
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all data in parallel
    const [mutualFunds, shares, insurance, loans] = await Promise.all([
      MutualFund.find({ userId }),
      Share.find({ userId }),
      Insurance.find({ userId }),
      Loan.find({ userId })
    ]);

    // Calculate summaries
    const mutualFundsSummary = {
      lumpsum: mutualFunds.filter(mf => mf.investmentType === 'lumpsum'),
      sip: mutualFunds.filter(mf => mf.investmentType === 'sip'),
      totalValue: mutualFunds.reduce((sum, mf) => sum + (mf.marketValue || 0), 0),
      totalInvested: mutualFunds.reduce((sum, mf) => sum + (mf.purchaseValue || 0), 0),
      totalProfit: mutualFunds.reduce((sum, mf) => sum + (mf.profit || 0), 0),
    };

    const sharesSummary = {
      totalValue: shares.reduce((sum, share) => sum + (share.currentValuation || 0), 0),
      totalInvested: shares.reduce((sum, share) => sum + (share.purchaseAmount || 0), 0),
      totalPL: shares.reduce((sum, share) => sum + (share.unrealisedPL || 0), 0),
    };

    const insuranceSummary = {
      life: insurance.filter(ins => ins.insuranceType === 'life'),
      health: insurance.filter(ins => ins.insuranceType === 'health'),
      totalSumAssured: insurance.reduce((sum, ins) => sum + (ins.sumAssured || 0), 0),
      totalSumInsured: insurance.reduce((sum, ins) => sum + (ins.sumInsured || 0), 0),
      totalPremium: insurance.reduce((sum, ins) => sum + (ins.premiumAmount || 0), 0),
    };

    const loansSummary = {
      totalBalance: loans.reduce((sum, loan) => sum + (loan.balance || 0), 0),
      totalEmi: loans.reduce((sum, loan) => sum + (loan.emiAmount || 0), 0),
      totalInterestPaid: loans.reduce((sum, loan) => sum + (loan.interestPaid || 0), 0),
      activeLoans: loans.filter(loan => loan.status === 'active').length,
    };

    const overallSummary = {
      totalInvestments: mutualFundsSummary.totalValue + sharesSummary.totalValue,
      totalInsurance: insuranceSummary.totalSumAssured + insuranceSummary.totalSumInsured,
      totalLoans: loansSummary.totalBalance,
      netWorth: (mutualFundsSummary.totalValue + sharesSummary.totalValue + insuranceSummary.totalSumAssured + insuranceSummary.totalSumInsured) - loansSummary.totalBalance,
    };

    res.json({
      success: true,
      data: {
        summary: overallSummary,
        mutualFunds: mutualFundsSummary,
        shares: sharesSummary,
        insurance: insuranceSummary,
        loans: loansSummary,
      }
    });

  } catch (error) {
    console.error('Error fetching investment summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investment summary',
      error: error.message
    });
  }
});

// MUTUAL FUNDS ROUTES
router.get('/mutual-funds', auth, async (req, res) => {
  try {
    const { type } = req.query; // 'lumpsum' or 'sip' or both
    const userId = req.user.id;

    let query = { userId };
    if (type) {
      query.investmentType = type;
    }

    const mutualFunds = await MutualFund.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        mutualFunds,
        count: mutualFunds.length
      }
    });

  } catch (error) {
    console.error('Error fetching mutual funds:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mutual funds',
      error: error.message
    });
  }
});

router.post('/mutual-funds', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const mutualFundData = { ...req.body, userId };

    const mutualFund = new MutualFund(mutualFundData);
    await mutualFund.save();

    res.status(201).json({
      success: true,
      message: 'Mutual fund investment created successfully',
      data: mutualFund
    });

  } catch (error) {
    console.error('Error creating mutual fund:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating mutual fund investment',
      error: error.message
    });
  }
});

router.put('/mutual-funds/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mutualFund = await MutualFund.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!mutualFund) {
      return res.status(404).json({
        success: false,
        message: 'Mutual fund investment not found'
      });
    }

    res.json({
      success: true,
      message: 'Mutual fund investment updated successfully',
      data: mutualFund
    });

  } catch (error) {
    console.error('Error updating mutual fund:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating mutual fund investment',
      error: error.message
    });
  }
});

router.delete('/mutual-funds/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mutualFund = await MutualFund.findOneAndDelete({ _id: id, userId });

    if (!mutualFund) {
      return res.status(404).json({
        success: false,
        message: 'Mutual fund investment not found'
      });
    }

    res.json({
      success: true,
      message: 'Mutual fund investment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting mutual fund:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting mutual fund investment',
      error: error.message
    });
  }
});

// SHARES ROUTES
router.get('/shares', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const shares = await Share.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        shares,
        count: shares.length
      }
    });

  } catch (error) {
    console.error('Error fetching shares:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shares',
      error: error.message
    });
  }
});

router.post('/shares', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const shareData = { ...req.body, userId };

    const share = new Share(shareData);
    await share.save();

    res.status(201).json({
      success: true,
      message: 'Share investment created successfully',
      data: share
    });

  } catch (error) {
    console.error('Error creating share:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating share investment',
      error: error.message
    });
  }
});

router.put('/shares/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const share = await Share.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share investment not found'
      });
    }

    res.json({
      success: true,
      message: 'Share investment updated successfully',
      data: share
    });

  } catch (error) {
    console.error('Error updating share:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating share investment',
      error: error.message
    });
  }
});

router.delete('/shares/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const share = await Share.findOneAndDelete({ _id: id, userId });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share investment not found'
      });
    }

    res.json({
      success: true,
      message: 'Share investment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting share:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting share investment',
      error: error.message
    });
  }
});

// Refresh price for a single share
router.post('/shares/refresh/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const share = await Share.findOne({ _id: id, userId });
    if (!share) return res.status(404).json({ success: false, message: 'Share not found' });

    const stockData = await stockFetchService.getStockPrice(share.scripName, share.exchange);
    if (!stockData) return res.status(422).json({ success: false, message: 'Could not fetch price for this scrip' });

    share.currentPrice = stockData.price;
    await share.save();

    res.json({
      success: true,
      message: 'Share price refreshed successfully',
      data: share
    });
  } catch (error) {
    console.error('Error refreshing share price:', error);
    res.status(500).json({ success: false, message: 'Error refreshing share price', error: error.message });
  }
});

// Refresh prices for all shares
router.post('/shares/refresh-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const shares = await Share.find({ userId });
    
    const results = {
      total: shares.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (const share of shares) {
      try {
        const stockData = await stockFetchService.getStockPrice(share.scripName, share.exchange);
        if (stockData) {
          share.currentPrice = stockData.price;
          await share.save();
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ scrip: share.scripName, error: 'No data returned' });
        }
      } catch (err) {
        results.failed++;
        results.errors.push({ scrip: share.scripName, error: err.message });
        console.warn(`Failed to refresh scrip ${share.scripName}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Refreshed ${results.success} shares. ${results.failed} failed.`,
      data: results
    });
  } catch (error) {
    console.error('Error refreshing all shares:', error);
    res.status(500).json({ success: false, message: 'Error refreshing all shares', error: error.message });
  }
});

// Get current price for a scrip name (not necessarily saved yet)
router.get('/shares/price/:scrip', auth, async (req, res) => {
  try {
    const { scrip } = req.params;
    const { exchange } = req.query;
    const stockData = await stockFetchService.getStockPrice(scrip, exchange);
    if (!stockData) return res.status(404).json({ success: false, message: 'Price not found' });
    res.json({ success: true, data: stockData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// INSURANCE ROUTES
router.get('/insurance', auth, async (req, res) => {
  try {
    const { type } = req.query; // 'life' or 'health' or both
    const userId = req.user.id;

    let query = { userId };
    if (type) {
      query.insuranceType = type;
    }

    const insurance = await Insurance.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        insurance,
        count: insurance.length
      }
    });

  } catch (error) {
    console.error('Error fetching insurance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching insurance',
      error: error.message
    });
  }
});

router.post('/insurance', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const insuranceData = { ...req.body, userId };

    const insurance = new Insurance(insuranceData);
    await insurance.save();

    res.status(201).json({
      success: true,
      message: 'Insurance policy created successfully',
      data: insurance
    });

  } catch (error) {
    console.error('Error creating insurance:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating insurance policy',
      error: error.message
    });
  }
});

router.put('/insurance/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const insurance = await Insurance.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found'
      });
    }

    res.json({
      success: true,
      message: 'Insurance policy updated successfully',
      data: insurance
    });

  } catch (error) {
    console.error('Error updating insurance:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating insurance policy',
      error: error.message
    });
  }
});

router.delete('/insurance/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const insurance = await Insurance.findOneAndDelete({ _id: id, userId });

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found'
      });
    }

    res.json({
      success: true,
      message: 'Insurance policy deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting insurance:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting insurance policy',
      error: error.message
    });
  }
});

// LOANS ROUTES
router.get('/loans', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const loans = await Loan.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        loans,
        count: loans.length
      }
    });

  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loans',
      error: error.message
    });
  }
});

router.post('/loans', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const loanData = { ...req.body, userId };

    const loan = new Loan(loanData);
    await loan.save();

    res.status(201).json({
      success: true,
      message: 'Loan created successfully',
      data: loan
    });

  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating loan',
      error: error.message
    });
  }
});

router.put('/loans/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const loan = await Loan.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    res.json({
      success: true,
      message: 'Loan updated successfully',
      data: loan
    });

  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating loan',
      error: error.message
    });
  }
});

router.delete('/loans/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const loan = await Loan.findOneAndDelete({ _id: id, userId });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    res.json({
      success: true,
      message: 'Loan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting loan:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting loan',
      error: error.message
    });
  }
});

// ============================================================
// SIP TRANSACTION ROUTES
// ============================================================

// GET /sip-transactions?folioNumber=X&mutualFundId=Y
router.get('/sip-transactions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { folioNumber, mutualFundId } = req.query;
    const query = { userId };
    if (folioNumber) query.folioNumber = folioNumber;
    if (mutualFundId) query.mutualFundId = mutualFundId;

    const transactions = await SIPTransaction.find(query).sort({ installmentDate: 1 });
    res.json({ success: true, data: { transactions, count: transactions.length } });
  } catch (error) {
    console.error('Error fetching SIP transactions:', error);
    res.status(500).json({ success: false, message: 'Error fetching SIP transactions', error: error.message });
  }
});

// POST /sip-transactions — add a single installment manually
router.post('/sip-transactions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const data = { ...req.body, userId };
    const tx = new SIPTransaction(data);
    await tx.save();
    res.status(201).json({ success: true, message: 'SIP transaction created', data: tx });
  } catch (error) {
    console.error('Error creating SIP transaction:', error);
    res.status(400).json({ success: false, message: 'Error creating SIP transaction', error: error.message });
  }
});

// POST /sip-transactions/generate/:mutualFundId — generate all past installments from sipStartDate → today
router.post('/sip-transactions/generate/:mutualFundId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { mutualFundId } = req.params;

    const mf = await MutualFund.findOne({ _id: mutualFundId, userId });
    if (!mf) return res.status(404).json({ success: false, message: 'Mutual fund not found' });
    if (mf.investmentType !== 'sip') return res.status(400).json({ success: false, message: 'Not a SIP investment' });
    if (!mf.sipStartDate) return res.status(400).json({ success: false, message: 'SIP start date not set' });

    const sipDayOfMonth = parseInt(mf.sipDate) || 5;
    const startDate = new Date(mf.sipStartDate);
    const today = new Date();

    // Build list of installment dates: every month from startDate → today on sipDayOfMonth
    const installmentDates = [];
    let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), sipDayOfMonth);
    // If start month's sipDay hasn't happened yet in startDate month, start from it
    // Otherwise start from first full month
    while (cursor <= today) {
      installmentDates.push(new Date(cursor));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, sipDayOfMonth);
    }

    // Fetch current NAV once, and also get schemeCode for historical NAV lookups
    let currentNAV = mf.currentNAV || 0;
    let currentNAVDate = null;
    let schemeCode = mf.schemeCode || null;

    if (mf.fundName) {
      try {
        const navData = await navFetchService.getCurrentNAVByName(mf.fundName, mf.isin);
        if (navData && navData.nav > 0) {
          currentNAV = navData.nav;
          currentNAVDate = navData.navDate;
          if (navData.schemeCode) schemeCode = navData.schemeCode;
          // Update MF record with current NAV and schemeCode for future use
          await MutualFund.findByIdAndUpdate(mutualFundId, {
            currentNAV,
            schemeCode: schemeCode || mf.schemeCode,
            updatedAt: Date.now(),
          });
        }
      } catch (navErr) {
        console.warn('Could not fetch NAV from mfapi.in:', navErr.message);
      }
    }

    // If NAV fetch failed, use the user-provided purchaseNAV as currentNAV fallback
    if (!currentNAV || currentNAV <= 0) {
      currentNAV = mf.purchaseNAV || 0;
      if (currentNAV > 0) {
        console.log(`Using stored purchaseNAV (${currentNAV}) as currentNAV fallback since mfapi fetch failed`);
      } else {
        console.warn(`Warning: No NAV available for fund "${mf.fundName}" — all installments will be skipped. Please add a Purchase NAV to the fund.`);
        return res.status(400).json({
          success: false,
          message: `Could not determine NAV for fund "${mf.fundName}". Please edit the SIP and enter a Purchase NAV as fallback, then try again.`,
        });
      }
    }

    // Delete existing auto-generated transactions for this fund (regenerate fresh)
    await SIPTransaction.deleteMany({ mutualFundId, userId });

    // Batch-fetch ALL historical NAV once (much faster than per-installment API calls)
    const created = [];
    const fundType = navFetchService.deriveFundType(mf.fundName);
    let historicalNavLookup = null;
    if (schemeCode) {
      try {
        const hist = await navFetchService.getAllHistoricalNAV(schemeCode);
        if (hist && hist.findNavForDate) {
          historicalNavLookup = hist.findNavForDate;
          console.log(`Historical NAV loaded for scheme ${schemeCode}: ${hist.entries.length} entries`);
        }
      } catch (e) {
        console.warn('Could not load historical NAV batch:', e.message);
      }
    }

    for (const date of installmentDates) {
      // Look up the historical NAV from batch data, fallback to currentNAV
      let purchaseNAV = currentNAV > 0 ? currentNAV : (mf.purchaseNAV || 0);
      let navDate = currentNAVDate;

      if (historicalNavLookup) {
        try {
          const hist = historicalNavLookup(date);
          if (hist && hist.nav && hist.nav > 0) {
            purchaseNAV = hist.nav;
            navDate = hist.navDate;
          }
        } catch (e) {
          // use fallback
        }
      }

      // Guard: skip installment if purchaseNAV is still 0 (would cause NaN)
      if (!purchaseNAV || purchaseNAV <= 0) {
        console.warn(`Skipping installment ${date.toISOString().split('T')[0]} — purchaseNAV is 0 or missing`);
        continue;
      }

      const rawUnits = mf.sipAmount / purchaseNAV;
      const units = isNaN(rawUnits) ? 0 : Math.round(rawUnits * 1000) / 1000;

      const rawCurrentValue = units * (currentNAV || 0);
      const currentValue = isNaN(rawCurrentValue) ? 0 : Math.round(rawCurrentValue * 1000) / 1000;

      const transactionDays = Math.max(0, Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)));

      const rawAbsReturn = mf.sipAmount > 0 ? ((currentValue - mf.sipAmount) / mf.sipAmount) * 10000 : 0;
      const absReturn = isNaN(rawAbsReturn) ? 0 : Math.round(rawAbsReturn) / 100;

      let annReturn = null;
      const years = transactionDays / 365;
      if (years > 0 && mf.sipAmount > 0 && currentValue > 0) {
        const rawAnn = (Math.pow(currentValue / mf.sipAmount, 1 / years) - 1) * 10000;
        annReturn = isNaN(rawAnn) ? null : Math.round(rawAnn) / 100;
      }

      // Safe navDate parsing
      let parsedNavDate = date;
      if (navDate) {
        try {
          const parts = navDate.split('-');
          // mfapi returns DD-MM-YYYY
          parsedNavDate = parts.length === 3 && parts[2].length === 4
            ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
            : new Date(navDate);
          if (isNaN(parsedNavDate.getTime())) parsedNavDate = date;
        } catch (e) {
          parsedNavDate = date;
        }
      }

      let parsedNavDate2 = today;
      if (currentNAVDate) {
        try {
          const parts = currentNAVDate.split('-');
          parsedNavDate2 = parts.length === 3 && parts[2].length === 4
            ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
            : new Date(currentNAVDate);
          if (isNaN(parsedNavDate2.getTime())) parsedNavDate2 = today;
        } catch (e) {
          parsedNavDate2 = today;
        }
      }

      const tx = new SIPTransaction({
        userId,
        mutualFundId,
        folioNumber: mf.folioNumber,
        fundName: mf.fundName,
        fundType,
        investorName: mf.investorName,
        broker: mf.broker,
        isin: mf.isin || '',
        installmentDate: date,
        sipAmount: mf.sipAmount,
        purchaseNAV,
        navDate: parsedNavDate,
        units,
        currentNAV: currentNAV || 0,
        currentNAVDate: parsedNavDate2,
        currentValue,
        transactionDays,
        absoluteReturn: absReturn,
        annualizedReturn: annReturn,
      });
      // Skip pre-save recalc (we already calculated above)
      tx.$skipMiddleware = true;
      await tx.save();
      created.push(tx);
    }

    // Update MutualFund with total units and purchase value
    const totalUnits = Math.round(created.reduce((s, t) => s + t.units, 0) * 1000) / 1000;
    const totalInvested = mf.sipAmount * created.length;
    await MutualFund.findByIdAndUpdate(mutualFundId, {
      units: totalUnits,
      purchaseValue: totalInvested,
      marketValue: Math.round(totalUnits * currentNAV * 100) / 100,
      currentNAV,
      updatedAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      message: `Generated ${created.length} SIP installments`,
      data: { count: created.length, transactions: created, currentNAV },
    });
  } catch (error) {
    console.error('Error generating SIP transactions:', error);
    res.status(500).json({ success: false, message: 'Error generating SIP transactions', error: error.message });
  }
});

// PUT /sip-transactions/:id — edit an installment
router.put('/sip-transactions/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const tx = await SIPTransaction.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!tx) return res.status(404).json({ success: false, message: 'SIP transaction not found' });
    res.json({ success: true, message: 'SIP transaction updated', data: tx });
  } catch (error) {
    console.error('Error updating SIP transaction:', error);
    res.status(400).json({ success: false, message: 'Error updating SIP transaction', error: error.message });
  }
});

// DELETE /sip-transactions/:id
router.delete('/sip-transactions/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const tx = await SIPTransaction.findOneAndDelete({ _id: id, userId });
    if (!tx) return res.status(404).json({ success: false, message: 'SIP transaction not found' });
    res.json({ success: true, message: 'SIP transaction deleted' });
  } catch (error) {
    console.error('Error deleting SIP transaction:', error);
    res.status(500).json({ success: false, message: 'Error deleting SIP transaction', error: error.message });
  }
});

// POST /mutual-funds/refresh-nav/:id — fetch latest NAV and update all transactions for this fund
router.post('/mutual-funds/refresh-nav/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mf = await MutualFund.findOne({ _id: id, userId });
    if (!mf) return res.status(404).json({ success: false, message: 'Mutual fund not found' });

    // Fetch latest NAV, but self-heal if the saved schemeCode belongs to a different ISIN
    let navData = null;
    if (mf.schemeCode) {
      navData = await navFetchService.getLatestNAVByCode(mf.schemeCode);
      // If the user provided an ISIN, and the saved schemeCode has a different ISIN, force a fresh search
      if (mf.isin && navData && navData.isin && !navData.isin.includes(mf.isin)) {
        console.log(`Self-healing needed: saved schemeCode ${mf.schemeCode} has ISIN ${navData.isin}, but user expects ${mf.isin}`);
        navData = null; 
      }
    }
    
    if (!navData && mf.fundName) {
      navData = await navFetchService.getCurrentNAVByName(mf.fundName, mf.isin);
      if (navData && navData.schemeCode && navData.schemeCode !== mf.schemeCode) {
        console.log(`Updated schemeCode for ${mf.fundName}: ${mf.schemeCode} -> ${navData.schemeCode}`);
        mf.schemeCode = navData.schemeCode; // Stage for save below
      }
    }

    if (!navData) return res.status(422).json({ success: false, message: 'Could not fetch NAV for this fund from mfapi.in' });

    const { nav: currentNAV, navDate } = navData;
    const today = new Date();

    // Update all SIP transactions for this fund
    const transactions = await SIPTransaction.find({ mutualFundId: id, userId });
    let totalUnits = 0;
    for (const tx of transactions) {
      const units = tx.units;
      const currentValue = Math.round(units * currentNAV * 1000) / 1000;
      const transactionDays = Math.floor((today.getTime() - new Date(tx.installmentDate).getTime()) / (1000 * 60 * 60 * 24));
      const absReturn = tx.sipAmount > 0 ? Math.round(((currentValue - tx.sipAmount) / tx.sipAmount) * 10000) / 100 : 0;
      let annReturn = null;
      const years = transactionDays / 365;
      if (years > 0 && tx.sipAmount > 0 && currentValue > 0) {
        annReturn = Math.round((Math.pow(currentValue / tx.sipAmount, 1 / years) - 1) * 10000) / 100;
      }
      await SIPTransaction.findByIdAndUpdate(tx._id, {
        currentNAV,
        currentNAVDate: today,
        currentValue,
        transactionDays,
        absoluteReturn: absReturn,
        annualizedReturn: annReturn,
        updatedAt: Date.now(),
      });
      totalUnits += units;
    }

    // Update MutualFund record
    totalUnits = Math.round(totalUnits * 1000) / 1000;
    await MutualFund.findByIdAndUpdate(id, {
      currentNAV,
      marketValue: Math.round(totalUnits * currentNAV * 100) / 100,
      units: totalUnits,
      updatedAt: Date.now(),
    });

    res.json({
      success: true,
      message: 'NAV refreshed successfully',
      data: { currentNAV, navDate, totalUnits, updatedTransactions: transactions.length },
    });
  } catch (error) {
    console.error('Error refreshing NAV:', error);
    res.status(500).json({ success: false, message: 'Error refreshing NAV', error: error.message });
  }
});

module.exports = router;