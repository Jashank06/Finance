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
        await fetchMonthlyIncome(months);
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
            // Do not auto-populate monthlyIncome, keep it user-defined or default to saved plan
        }
    };

    const handleSaveBudgetPlan = async () => {
        const manualIncome = parseFloat(monthlyIncome) || 0;
        const autoIncome = calculatedMonthlyIncome?.averageIncome || calculatedMonthlyIncome?.lastMonthIncome || 0;
        const finalIncome = (manualIncome > 0 && autoIncome > 0)
            ? Math.min(manualIncome, autoIncome)
            : (manualIncome || autoIncome);

        if (!selectedPlan) {
            alert('Please select a plan');
            return;
        }

        if (finalIncome <= 0) {
            alert('Please enter a valid monthly income or ensure your average is calculated');
            return;
        }

        setLoading(true);
        try {
            await api.post('/budget/budget-plan', {
                selectedPlan,
                monthlyIncome: finalIncome
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

                {/* Income Input Modal */}
                {selectedPlan && (
                    <div className="modal-overlay-premium">
                        <div className="modal-content-premium">
                            <button
                                className="modal-close-btn"
                                onClick={() => setSelectedPlan(null)}
                            >
                                ×
                            </button>

                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>
                                💰 Enter Your Monthly Income
                            </h3>

                            <div className="income-form-grid">
                                {/* Average Months Selector */}
                                <div className="form-group-budget full-width">
                                    <label>
                                        Calculate Average From <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <select
                                        value={averageMonths}
                                        onChange={(e) => handleAverageMonthsChange(parseInt(e.target.value))}
                                        className="income-input"
                                        style={{ width: '100%', cursor: 'pointer' }}
                                    >
                                        <option value={1}>Last 1 Month</option>
                                        <option value={2}>Last 2 Months Average</option>
                                        <option value={3}>Last 3 Months Average</option>
                                        <option value={4}>Last 4 Months Average</option>
                                        <option value={5}>Last 5 Months Average</option>
                                        <option value={6}>Last 6 Months Average</option>
                                        <option value={12}>Last 12 Months Average</option>
                                    </select>
                                    <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
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

                                {/* Calculated Income (Read Only) */}
                                <div className="form-group-budget">
                                    <label>Present Monthly Average Income</label>
                                    <div className="income-input-group" style={{ backgroundColor: '#f9fafb' }}>
                                        <span className="input-prefix">$</span>
                                        <input
                                            type="text"
                                            value={calculatedMonthlyIncome?.averageIncome?.toFixed(2) || calculatedMonthlyIncome?.lastMonthIncome?.toFixed(2) || '0.00'}
                                            readOnly
                                            className="income-input"
                                            style={{ backgroundColor: 'transparent', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                    <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                        {loadingIncome ? '⏳ Calculating...' : 'Based on transaction history'}
                                    </small>
                                </div>

                                {/* Want Monthly Income (Editable) */}
                                <div className="form-group-budget">
                                    <label>Want Monthly Income</label>
                                    <div className="income-input-group">
                                        <span className="input-prefix">$</span>
                                        <input
                                            type="number"
                                            value={monthlyIncome}
                                            onChange={(e) => setMonthlyIncome(e.target.value)}
                                            placeholder="0.00"
                                            className="income-input"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                        Enter your income target
                                    </small>
                                </div>

                                {/* Final Baseline Indicator */}
                                <div className="full-width" style={{
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid #3b82f6',
                                    marginTop: '8px'
                                }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1d4ed8', display: 'block', marginBottom: '8px' }}>
                                        📊 Budgeting Baseline (Lower Value)
                                    </span>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e40af' }}>
                                        {(() => {
                                            const manualIncome = parseFloat(monthlyIncome) || 0;
                                            const autoIncome = calculatedMonthlyIncome?.averageIncome || calculatedMonthlyIncome?.lastMonthIncome || 0;
                                            const finalIncome = (manualIncome > 0 && autoIncome > 0)
                                                ? Math.min(manualIncome, autoIncome)
                                                : (manualIncome || autoIncome);
                                            return `$${finalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                        })()}
                                    </div>
                                    <small style={{ color: '#2563eb', fontSize: '0.875rem', display: 'block', marginTop: '4px' }}>
                                        {(() => {
                                            const manualIncome = parseFloat(monthlyIncome) || 0;
                                            const autoIncome = calculatedMonthlyIncome?.averageIncome || calculatedMonthlyIncome?.lastMonthIncome || 0;
                                            if (manualIncome > 0 && autoIncome > 0) {
                                                const isUsingManual = manualIncome <= autoIncome;
                                                return `Using lower value: ${isUsingManual ? 'Your manual entry' : 'Monthly average'}`;
                                            }
                                            return manualIncome > 0 ? 'Using your manual entry' : autoIncome > 0 ? 'Using your monthly average' : 'Waiting for income data...';
                                        })()}
                                    </small>
                                </div>
                            </div>

                            <div className="modal-actions-premium">
                                <button
                                    onClick={() => setSelectedPlan(null)}
                                    className="cancel-btn-premium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveBudgetPlan}
                                    className="save-budget-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Budget Plan'}
                                </button>
                            </div>
                        </div>
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
