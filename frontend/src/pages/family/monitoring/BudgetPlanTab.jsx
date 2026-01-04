import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './BudgetPlan.css';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const BudgetPlanTab = () => {
    const [budgetPlans, setBudgetPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [currentBudgetPlan, setCurrentBudgetPlan] = useState(null);
    const [budgetAnalysis, setBudgetAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [calculatedMonthlyIncome, setCalculatedMonthlyIncome] = useState(null);
    const [loadingIncome, setLoadingIncome] = useState(false);
    const [averageMonths, setAverageMonths] = useState(1); // Default to 1 month

    useEffect(() => {
    trackFeatureUsage('/family/monitoring/budget-plan', 'view');
        fetchBudgetPlans();
        fetchCurrentPlanAndAnalysis();
        fetchMonthlyIncome(1); // Fetch with default 1 month
    }, []);

    const fetchBudgetPlans = async () => {
        try {
            const response = await api.get('/budget/budget-plan/plans');
            setBudgetPlans(response.data);
        } catch (error) {
            console.error('Error fetching budget plans:', error);
        }
    };

    const fetchMonthlyIncome = async (months = 1) => {
        setLoadingIncome(true);
        try {
            const response = await api.get(`/cashflow/monthly-income?months=${months}`);
            if (response.data.success) {
                setCalculatedMonthlyIncome(response.data.data);
                // Auto-populate monthlyIncome if not set
                const avgIncome = response.data.data.averageIncome || response.data.data.lastMonthIncome || 0;
                if (!monthlyIncome && avgIncome > 0) {
                    setMonthlyIncome(avgIncome.toFixed(2));
                }
                return response.data.data;
            }
        } catch (error) {
            console.error('Error fetching monthly income:', error);
        }
        setLoadingIncome(false);
        return null;
    };

    // Handle average months change
    const handleAverageMonthsChange = async (months) => {
        setAverageMonths(months);
        const newIncomeData = await fetchMonthlyIncome(months);
        
        // Update form with new average immediately
        if (newIncomeData) {
            const avgIncome = newIncomeData.averageIncome?.toFixed(2) || newIncomeData.lastMonthIncome?.toFixed(2) || '';
            setMonthlyIncome(avgIncome);
        }
    };

    const fetchCurrentPlanAndAnalysis = async () => {
        setLoading(true);
        try {
            // Try to fetch current plan
            const planResponse = await api.get('/budget/budget-plan');
            setCurrentBudgetPlan(planResponse.data);
            setSelectedPlan(planResponse.data.selectedPlan);
            setMonthlyIncome(planResponse.data.monthlyIncome.toString());

            // Fetch analysis
            const analysisResponse = await api.get('/budget/budget-plan/analysis');
            setBudgetAnalysis(analysisResponse.data);
        } catch (error) {
            if (error.response?.status === 404) {
                // No budget plan exists yet
                setShowIncomeForm(true);
            }
            console.error('Error fetching budget data:', error);
        }
        setLoading(false);
    };

    const handlePlanSelect = (planId) => {
        setSelectedPlan(planId);
        if (!currentBudgetPlan) {
            setShowIncomeForm(true);
            // Auto-populate income from calculated data
            if (calculatedMonthlyIncome && calculatedMonthlyIncome.lastMonthIncome > 0) {
                setMonthlyIncome(calculatedMonthlyIncome.lastMonthIncome.toFixed(2));
            }
        }
    };

    const handleSaveBudgetPlan = async () => {
        if (!selectedPlan || !monthlyIncome || parseFloat(monthlyIncome) <= 0) {
            alert('Please select a plan and enter a valid monthly income');
            return;
        }

        setLoading(true);
        try {
            await api.post('/budget/budget-plan', {
                selectedPlan,
                monthlyIncome: parseFloat(monthlyIncome)
            });

            setShowIncomeForm(false);
            await fetchCurrentPlanAndAnalysis();
        } catch (error) {
            console.error('Error saving budget plan:', error);
            alert(`Error saving budget plan: ${error.response?.data?.message || error.message}`);
        }
        setLoading(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'over': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'good': return '✅';
            case 'warning': return '⚠️';
            case 'over': return '🚨';
            default: return '📊';
        }
    };

    if (loading && !budgetAnalysis) {
        return <div className="loading">Loading budget data...</div>;
    }

    if (!currentBudgetPlan || showIncomeForm) {
        return (
            <div className="budget-plan-setup">
                <div className="setup-header">
                    <h2>📊 Choose Your Budget Plan</h2>
                    <p>Select a budget plan that fits your financial goals and lifestyle</p>
                </div>

                {/* Plan Selection Cards */}
                <div className="budget-plans-grid">
                    {budgetPlans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`budget-plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                            onClick={() => handlePlanSelect(plan.id)}
                        >
                            <div className="plan-header">
                                <h3>{plan.name}</h3>
                                {selectedPlan === plan.id && <span className="check-icon">✓</span>}
                            </div>

                            <div className="plan-allocations">
                                {Object.entries(plan.allocations).map(([key, value]) => (
                                    value > 0 && (
                                        <div key={key} className="allocation-item">
                                            <span className="allocation-label">
                                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                            </span>
                                            <span className="allocation-value">{value}%</span>
                                        </div>
                                    )
                                ))}
                            </div>

                            <div className="plan-categories">
                                <small>Includes:</small>
                                {Object.entries(plan.categoryMappings).map(([key, categories]) => (
                                    categories.length > 0 && (
                                        <div key={key} className="category-group">
                                            <strong>{key}:</strong>
                                            <ul>
                                                {categories.map((cat, idx) => (
                                                    <li key={idx}>{cat}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Income Input Form */}
                {selectedPlan && (
                    <div className="income-form-section">
                        <h3>💰 Enter Your Monthly Income</h3>
                        
                        {/* Average Months Selector */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                Calculate Average From <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select
                                value={averageMonths}
                                onChange={(e) => handleAverageMonthsChange(parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '2px solid #e5e7eb',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value={1}>Last 1 Month</option>
                                <option value={2}>Last 2 Months Average</option>
                                <option value={3}>Last 3 Months Average</option>
                                <option value={4}>Last 4 Months Average</option>
                                <option value={5}>Last 5 Months Average</option>
                                <option value={6}>Last 6 Months Average</option>
                                <option value={12}>Last 12 Months Average</option>
                            </select>
                            <small style={{ color: '#6b7280', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
                                {loadingIncome ? (
                                    '⏳ Calculating average from your transactions...'
                                ) : calculatedMonthlyIncome ? (
                                    <>
                                        📊 Calculated from {averageMonths} month{averageMonths > 1 ? 's' : ''} of data
                                    </>
                                ) : (
                                    'Select how many months to average'
                                )}
                            </small>
                        </div>

                        <div className="income-input-group">
                            <span className="input-prefix">$</span>
                            <input
                                type="number"
                                value={monthlyIncome}
                                onChange={(e) => setMonthlyIncome(e.target.value)}
                                placeholder="Enter monthly income"
                                className="income-input"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '8px', display: 'block' }}>
                            {loadingIncome ? (
                                '⏳ Calculating...'
                            ) : calculatedMonthlyIncome ? (
                                <>
                                    💡 {averageMonths === 1 ? 'Last month' : `${averageMonths}-month average`}: <strong>${calculatedMonthlyIncome.averageIncome?.toFixed(2) || calculatedMonthlyIncome.lastMonthIncome?.toFixed(2) || '0.00'}</strong>
                                </>
                            ) : (
                                'Enter your monthly income'
                            )}
                        </small>
                        <button
                            onClick={handleSaveBudgetPlan}
                            className="save-budget-btn"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Budget Plan'}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Budget Analysis Dashboard
    return (
        <div className="budget-analysis-dashboard">
            {/* Header with Plan Info */}
            <div className="budget-header">
                <div className="budget-header-left">
                    <h2>📊 {budgetAnalysis?.budgetPlan?.planName}</h2>
                    <p className="income-display">Monthly Income: {formatCurrency(budgetAnalysis?.budgetPlan?.monthlyIncome)}</p>
                </div>
                <button
                    onClick={() => {
                        setShowIncomeForm(true);
                        setCurrentBudgetPlan(null);
                    }}
                    className="change-plan-btn"
                >
                    Change Plan
                </button>
            </div>

            {/* Budget Summary Cards */}
            <div className="budget-summary-cards">
                <div className="summary-card">
                    <div className="card-icon">💵</div>
                    <div className="card-content">
                        <h4>Total Budget</h4>
                        <p className="card-value">{formatCurrency(budgetAnalysis?.analysis?.totalBudget)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">💸</div>
                    <div className="card-content">
                        <h4>Total Spent</h4>
                        <p className="card-value">{formatCurrency(budgetAnalysis?.analysis?.totalActual)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">
                        {budgetAnalysis?.analysis?.totalRemaining >= 0 ? '💰' : '⚠️'}
                    </div>
                    <div className="card-content">
                        <h4>Remaining</h4>
                        <p className={`card-value ${budgetAnalysis?.analysis?.totalRemaining >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(budgetAnalysis?.analysis?.totalRemaining)}
                        </p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon">📈</div>
                    <div className="card-content">
                        <h4>Utilization</h4>
                        <p className="card-value">{budgetAnalysis?.summary?.budgetUtilization}%</p>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="category-breakdown">
                <h3>Category Breakdown</h3>
                <div className="categories-grid">
                    {budgetAnalysis && Object.keys(budgetAnalysis.analysis.budgetAllocations).map((category) => {
                        const budgetAmount = budgetAnalysis.analysis.budgetAllocations[category];
                        const actualAmount = budgetAnalysis.analysis.actualExpenses[category] || 0;
                        const status = budgetAnalysis.analysis.status[category];
                        const percentage = budgetAnalysis.analysis.percentages[category];

                        return (
                            <div key={category} className="category-card">
                                <div className="category-header">
                                    <h4>{getStatusIcon(status)} {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}</h4>
                                    <span className="category-status" style={{ color: getStatusColor(status) }}>
                                        {status === 'good' ? 'On Track' : status === 'warning' ? 'Close to Limit' : 'Over Budget'}
                                    </span>
                                </div>

                                <div className="category-amounts">
                                    <div className="amount-row">
                                        <span>Budget:</span>
                                        <strong>{formatCurrency(budgetAmount)}</strong>
                                    </div>
                                    <div className="amount-row">
                                        <span>Spent:</span>
                                        <strong style={{ color: getStatusColor(status) }}>
                                            {formatCurrency(actualAmount)}
                                        </strong>
                                    </div>
                                    <div className="amount-row">
                                        <span>Remaining:</span>
                                        <strong className={budgetAmount - actualAmount >= 0 ? 'positive' : 'negative'}>
                                            {formatCurrency(budgetAmount - actualAmount)}
                                        </strong>
                                    </div>
                                </div>

                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.min(percentage, 100)}%`,
                                            backgroundColor: getStatusColor(status)
                                        }}
                                    />
                                </div>
                                <div className="progress-label">{percentage.toFixed(1)}% Used</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Suggestions Panel */}
            {budgetAnalysis?.suggestions?.length > 0 && (
                <div className="suggestions-panel">
                    <h3>💡 Suggestions & Insights</h3>
                    <div className="suggestions-list">
                        {budgetAnalysis.suggestions.map((suggestion, idx) => (
                            <div key={idx} className={`suggestion-item ${suggestion.type}`}>
                                <div className="suggestion-icon">
                                    {suggestion.type === 'warning' ? '⚠️' :
                                        suggestion.type === 'caution' ? '⚡' :
                                            suggestion.type === 'alert' ? '🚨' : '✅'}
                                </div>
                                <div className="suggestion-content">
                                    <p className="suggestion-message">{suggestion.message}</p>
                                    <p className="suggestion-recommendation">{suggestion.recommendation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Expense Summary */}
            <div className="expense-summary">
                <h3>📋 Expense Summary</h3>
                <div className="summary-stats">
                    <div className="stat-item">
                        <span>Total Transactions</span>
                        <strong>{budgetAnalysis?.summary?.totalTransactions || 0}</strong>
                    </div>
                    <div className="stat-item">
                        <span>Total Bills</span>
                        <strong>{budgetAnalysis?.summary?.totalBills || 0}</strong>
                    </div>
                    <div className="stat-item">
                        <span>Total EMIs</span>
                        <strong>{budgetAnalysis?.summary?.totalEMIs || 0}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetPlanTab;
