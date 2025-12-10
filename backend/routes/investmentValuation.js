const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MutualFund = require('../models/MutualFund');
const Share = require('../models/Share');
const Insurance = require('../models/Insurance');
const Loan = require('../models/Loan');

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

module.exports = router;