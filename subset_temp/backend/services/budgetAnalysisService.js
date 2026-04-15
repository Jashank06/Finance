const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const mongoose = require('mongoose');

class BudgetAnalysisService {
    /**
     * Aggregate all expenses for a user for the current month
     */
    static async aggregateMonthlyExpenses(userId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get transactions from Cash/Cards/Bank
        const transactions = await Transaction.find({
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
            transactionType: 'Expense'
        });

        // Get bills (Scheduled Expenses)
        let bills = [];
        try {
            // ScheduledExpense model is defined in the routes file, so we access it via mongoose
            if (mongoose.models.ScheduledExpense) {
                const ScheduledExpense = mongoose.model('ScheduledExpense');
                bills = await ScheduledExpense.find({
                    userId,
                    dueDate: { $gte: startOfMonth, $lte: endOfMonth },
                    isActive: true
                });
            }
        } catch (error) {
            console.error('Error fetching scheduled expenses:', error);
        }

        // Get EMIs (Loans)
        const financeObligations = await Loan.find({
            userId,
            status: 'active'
        });

        return {
            transactions,
            bills,
            financeObligations,
            dateRange: { startOfMonth, endOfMonth }
        };
    }

    /**
     * Categorize expenses into budget categories
     */
    static categorizeExpenses(transactions, bills, financeObligations) {
        const categories = {
            needs: {
                items: [],
                total: 0,
                subcategories: {
                    'Fixed & Contractual Costs': { items: [], total: 0 },
                    'Variable Living Expenses': { items: [], total: 0 }
                }
            },
            wants: {
                items: [],
                total: 0,
                subcategories: {
                    'Financial Protection & Security': { items: [], total: 0 },
                    'Long-Term Savings & Investments': { items: [], total: 0 },
                    'Periodic & Large Expenses': { items: [], total: 0 }
                }
            },
            savings: {
                items: [],
                total: 0,
                subcategories: {
                    'Discretionary & Lifestyle': { items: [], total: 0 }
                }
            },
            investment: {
                items: [],
                total: 0,
                subcategories: {}
            },
            survivalBuffer: {
                items: [],
                total: 0,
                subcategories: {
                    'Financial Protection & Security': { items: [], total: 0 }
                }
            }
        };

        // Categorize transactions
        transactions.forEach(txn => {
            const amount = Math.abs(txn.amount || 0);
            const item = {
                type: 'transaction',
                description: txn.description || txn.category || 'Transaction',
                amount,
                date: txn.date,
                category: txn.category,
                expenseType: txn.expenseType
            };

            // Categorization logic based on expense type and category
            if (this.isNeedExpense(txn)) {
                const subcategory = this.isFixedCost(txn)
                    ? 'Fixed & Contractual Costs'
                    : 'Variable Living Expenses';
                categories.needs.items.push(item);
                categories.needs.subcategories[subcategory].items.push(item);
                categories.needs.subcategories[subcategory].total += amount;
                categories.needs.total += amount;
            } else if (this.isSavingsExpense(txn)) {
                categories.savings.items.push(item);
                categories.savings.subcategories['Discretionary & Lifestyle'].items.push(item);
                categories.savings.subcategories['Discretionary & Lifestyle'].total += amount;
                categories.savings.total += amount;
            } else if (this.isInvestmentExpense(txn)) {
                categories.investment.items.push(item);
                categories.investment.total += amount;
            } else {
                // Default to wants
                categories.wants.items.push(item);
                categories.wants.total += amount;
            }
        });

        // Categorize bills
        bills.forEach(bill => {
            const amount = bill.amount || 0;
            const item = {
                type: 'bill',
                description: bill.title || bill.description || 'Bill Payment',
                amount,
                date: bill.dueDate,
                category: bill.category
            };

            // Most bills are needs (utilities, rent, etc.)
            const subcategory = 'Fixed & Contractual Costs';
            categories.needs.items.push(item);
            categories.needs.subcategories[subcategory].items.push(item);
            categories.needs.subcategories[subcategory].total += amount;
            categories.needs.total += amount;
        });

        // Categorize EMIs and financial obligations
        financeObligations.forEach(obligation => {
            const monthlyAmount = obligation.emiAmount || 0;
            const item = {
                type: 'emi',
                description: obligation.debtorName || obligation.loanType || 'EMI',
                amount: monthlyAmount,
                category: 'loan-payment'
            };

            // EMIs are typically needs (fixed costs)
            const subcategory = 'Fixed & Contractual Costs';
            categories.needs.items.push(item);
            categories.needs.subcategories[subcategory].items.push(item);
            categories.needs.subcategories[subcategory].total += monthlyAmount;
            categories.needs.total += monthlyAmount;
        });

        return categories;
    }

    /**
     * Helper: Determine if expense is a Need
     */
    static isNeedExpense(transaction) {
        const needCategories = [
            'groceries', 'food', 'utilities', 'rent', 'mortgage',
            'transportation', 'fuel', 'insurance', 'healthcare',
            'education', 'childcare', 'loan payment', 'emi'
        ];

        const category = (transaction.category || '').toLowerCase();
        const expenseType = (transaction.expenseType || '').toLowerCase();
        const description = (transaction.description || '').toLowerCase();

        return needCategories.some(need =>
            category.includes(need) ||
            expenseType.includes(need) ||
            description.includes(need)
        );
    }

    /**
     * Helper: Determine if expense is a Fixed Cost
     */
    static isFixedCost(transaction) {
        const fixedCategories = [
            'rent', 'mortgage', 'insurance', 'loan payment',
            'emi', 'subscription', 'internet', 'phone'
        ];

        const category = (transaction.category || '').toLowerCase();
        const expenseType = (transaction.expenseType || '').toLowerCase();

        return fixedCategories.some(fixed =>
            category.includes(fixed) ||
            expenseType.includes(fixed)
        );
    }

    /**
     * Helper: Determine if expense is Savings
     */
    static isSavingsExpense(transaction) {
        const savingsCategories = [
            'savings', 'emergency fund', 'deposit'
        ];

        const category = (transaction.category || '').toLowerCase();
        const expenseType = (transaction.expenseType || '').toLowerCase();

        return savingsCategories.some(savings =>
            category.includes(savings) ||
            expenseType.includes(savings)
        );
    }

    /**
     * Helper: Determine if expense is Investment
     */
    static isInvestmentExpense(transaction) {
        const investmentCategories = [
            'investment', 'stock', 'mutual fund', 'gold',
            'sgb', 'shares', 'crypto', 'real estate'
        ];

        const category = (transaction.category || '').toLowerCase();
        const expenseType = (transaction.expenseType || '').toLowerCase();

        return investmentCategories.some(investment =>
            category.includes(investment) ||
            expenseType.includes(investment)
        );
    }

    /**
     * Analyze budget vs actual expenses
     */
    static analyzeBudget(budgetPlan, categorizedExpenses, monthlyIncome) {
        const analysis = {
            income: monthlyIncome,
            budgetAllocations: {},
            actualExpenses: {},
            differences: {},
            percentages: {},
            status: {},
            totalBudget: 0,
            totalActual: 0,
            totalRemaining: 0
        };

        // Calculate budget allocations and compare with actual
        const allocations = budgetPlan.planDetails.allocations;

        Object.keys(allocations).forEach(category => {
            if (allocations[category] > 0) {
                const budgetAmount = (monthlyIncome * allocations[category]) / 100;
                const actualAmount = categorizedExpenses[category]?.total || 0;
                const difference = budgetAmount - actualAmount;
                const percentageUsed = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0;

                analysis.budgetAllocations[category] = budgetAmount;
                analysis.actualExpenses[category] = actualAmount;
                analysis.differences[category] = difference;
                analysis.percentages[category] = percentageUsed;

                // Determine status
                if (percentageUsed > 100) {
                    analysis.status[category] = 'over';
                } else if (percentageUsed > 90) {
                    analysis.status[category] = 'warning';
                } else {
                    analysis.status[category] = 'good';
                }

                analysis.totalBudget += budgetAmount;
                analysis.totalActual += actualAmount;
            }
        });

        analysis.totalRemaining = analysis.totalBudget - analysis.totalActual;

        return analysis;
    }

    /**
     * Generate budget suggestions
     */
    static generateSuggestions(analysis, categorizedExpenses) {
        const suggestions = [];

        Object.keys(analysis.status).forEach(category => {
            const status = analysis.status[category];
            const difference = analysis.differences[category];
            const budgetAmount = analysis.budgetAllocations[category];
            const actualAmount = analysis.actualExpenses[category];

            if (status === 'over') {
                suggestions.push({
                    type: 'warning',
                    category,
                    message: `You've exceeded your ${category} budget by $${Math.abs(difference).toFixed(2)} (${((actualAmount - budgetAmount) / budgetAmount * 100).toFixed(1)}% over).`,
                    recommendation: `Review your ${category} expenses and consider reducing discretionary spending in this category.`
                });
            } else if (status === 'warning') {
                suggestions.push({
                    type: 'caution',
                    category,
                    message: `You're approaching your ${category} budget limit. Only $${difference.toFixed(2)} remaining.`,
                    recommendation: `Monitor your ${category} spending carefully for the rest of the month.`
                });
            } else if (difference > budgetAmount * 0.5) {
                suggestions.push({
                    type: 'success',
                    category,
                    message: `Great job! You have $${difference.toFixed(2)} remaining in your ${category} budget.`,
                    recommendation: `Consider allocating some of these savings to your emergency fund or investments.`
                });
            }
        });

        // Overall budget health
        if (analysis.totalActual > analysis.totalBudget) {
            suggestions.push({
                type: 'alert',
                category: 'overall',
                message: `You're over budget by $${(analysis.totalActual - analysis.totalBudget).toFixed(2)} this month.`,
                recommendation: 'Review all expense categories and identify areas where you can cut back.'
            });
        } else if (analysis.totalRemaining > 0) {
            suggestions.push({
                type: 'success',
                category: 'overall',
                message: `You're under budget with $${analysis.totalRemaining.toFixed(2)} remaining.`,
                recommendation: 'Consider saving or investing this surplus to build long-term wealth.'
            });
        }

        return suggestions;
    }

    /**
     * Complete budget analysis
     */
    static async performCompleteAnalysis(userId, budgetPlan) {
        // Aggregate expenses
        const { transactions, bills, financeObligations } = await this.aggregateMonthlyExpenses(userId);

        // Categorize expenses
        const categorizedExpenses = this.categorizeExpenses(transactions, bills, financeObligations);

        // Analyze budget vs actual
        const analysis = this.analyzeBudget(budgetPlan, categorizedExpenses, budgetPlan.monthlyIncome);

        // Generate suggestions
        const suggestions = this.generateSuggestions(analysis, categorizedExpenses);

        return {
            categorizedExpenses,
            analysis,
            suggestions,
            summary: {
                totalTransactions: transactions.length,
                totalBills: bills.length,
                totalEMIs: financeObligations.length,
                totalExpenses: analysis.totalActual,
                budgetUtilization: (analysis.totalActual / analysis.totalBudget * 100).toFixed(1)
            }
        };
    }
}

module.exports = BudgetAnalysisService;
