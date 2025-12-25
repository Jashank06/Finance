const express = require('express');
const router = express.Router();
const BudgetPlan = require('../models/BudgetPlan');
const BudgetAnalysisService = require('../services/budgetAnalysisService');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @route   POST /budget/budget-plan
 * @desc    Create or update user's budget plan
 * @access  Private
 */
router.post('/budget-plan', async (req, res) => {
    try {
        const { selectedPlan, monthlyIncome } = req.body;

        // Validate input
        if (!selectedPlan || !monthlyIncome) {
            return res.status(400).json({ message: 'Selected plan and monthly income are required' });
        }

        if (monthlyIncome <= 0) {
            return res.status(400).json({ message: 'Monthly income must be greater than 0' });
        }

        // Get plan details
        const planDetails = BudgetPlan.getPlanDetails(selectedPlan);
        if (!planDetails) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        // Check if user already has a budget plan
        let budgetPlan = await BudgetPlan.findOne({ userId: req.user._id });

        if (budgetPlan) {
            // Update existing plan
            budgetPlan.selectedPlan = selectedPlan;
            budgetPlan.monthlyIncome = monthlyIncome;
            budgetPlan.planDetails = planDetails;
            budgetPlan.updatedAt = new Date();
            await budgetPlan.save();
        } else {
            // Create new plan
            budgetPlan = new BudgetPlan({
                userId: req.user._id,
                selectedPlan,
                monthlyIncome,
                planDetails
            });
            await budgetPlan.save();
        }

        res.status(200).json({
            message: 'Budget plan saved successfully',
            budgetPlan
        });
    } catch (error) {
        console.error('Error saving budget plan:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /budget/budget-plan
 * @desc    Get user's current budget plan
 * @access  Private
 */
router.get('/budget-plan', async (req, res) => {
    try {
        const budgetPlan = await BudgetPlan.findOne({ userId: req.user._id });

        if (!budgetPlan) {
            return res.status(404).json({ message: 'No budget plan found. Please create one first.' });
        }

        res.status(200).json(budgetPlan);
    } catch (error) {
        console.error('Error fetching budget plan:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /budget/budget-plan/analysis
 * @desc    Get budget analysis with expense breakdown
 * @access  Private
 */
router.get('/budget-plan/analysis', async (req, res) => {
    try {
        // Get user's budget plan
        const budgetPlan = await BudgetPlan.findOne({ userId: req.user._id });

        if (!budgetPlan) {
            return res.status(404).json({
                message: 'No budget plan found. Please create a budget plan first.'
            });
        }

        // Perform complete analysis
        const analysisResult = await BudgetAnalysisService.performCompleteAnalysis(
            req.user._id,
            budgetPlan
        );

        res.status(200).json({
            budgetPlan: {
                selectedPlan: budgetPlan.selectedPlan,
                planName: budgetPlan.planDetails.name,
                monthlyIncome: budgetPlan.monthlyIncome,
                allocations: budgetPlan.planDetails.allocations
            },
            ...analysisResult
        });
    } catch (error) {
        console.error('Error performing budget analysis:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /budget/budget-plan/plans
 * @desc    Get all available budget plans
 * @access  Private
 */
router.get('/budget-plan/plans', async (req, res) => {
    try {
        const plans = [
            { id: 'bare_minimum', ...BudgetPlan.getPlanDetails('bare_minimum') },
            { id: 'most_popular', ...BudgetPlan.getPlanDetails('most_popular') },
            { id: 'standard', ...BudgetPlan.getPlanDetails('standard') },
            { id: 'stable', ...BudgetPlan.getPlanDetails('stable') },
            { id: 'good', ...BudgetPlan.getPlanDetails('good') }
        ];

        res.status(200).json(plans);
    } catch (error) {
        console.error('Error fetching budget plans:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /budget/budget-plan
 * @desc    Delete user's budget plan
 * @access  Private
 */
router.delete('/budget-plan', async (req, res) => {
    try {
        const result = await BudgetPlan.findOneAndDelete({ userId: req.user._id });

        if (!result) {
            return res.status(404).json({ message: 'No budget plan found to delete' });
        }

        res.status(200).json({ message: 'Budget plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget plan:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
