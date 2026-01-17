import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import BudgetPlanTab from './BudgetPlanTab';
import './TargetsForLife.css';
import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';
import { staticAPI } from '../../../utils/staticAPI';
import { investmentProfileAPI } from '../../../utils/investmentProfileAPI';
import { investmentAPI } from '../../../utils/investmentAPI';

const TargetsForLife = () => {
    const [loading, setLoading] = useState(false);
    const [targets, setTargets] = useState([]);
    const [showTargetForm, setShowTargetForm] = useState(false);
    const [showEmergencyFundForm, setShowEmergencyFundForm] = useState(false);
    const [editingTarget, setEditingTarget] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [budgetPlans, setBudgetPlans] = useState([]);
    const [selectedBudgetPlan, setSelectedBudgetPlan] = useState(null);
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [budgetAnalysis, setBudgetAnalysis] = useState(null);
    const [loadingBudget, setLoadingBudget] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [targetForm, setTargetForm] = useState({
        goalType: '',
        specificGoal: '',
        timeHorizon: '',
        estimatedCost: '',
        recommendedInvestmentVehicle: [],
        riskTolerance: '',
        targetDate: '',
        monthlyExpenses: '',
        monthsOfCoverage: ''
    });
    const [calculatedMonthlyExpenses, setCalculatedMonthlyExpenses] = useState(null);
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [averageMonths, setAverageMonths] = useState(1); // Default to 1 month
    const [investmentVehicleOptions, setInvestmentVehicleOptions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        trackFeatureUsage('/family/monitoring/targets-for-life', 'view');
        fetchData();
        fetchMonthlyExpenses(1); // Fetch with default 1 month
        fetchInvestmentVehicleOptions();
    }, []);

    const fetchInvestmentVehicleOptions = async () => {
        try {
            const options = [
                { category: 'NPS / Post Office / PPF Investments', items: [] },
                { category: 'Gold / SGB / Silver / Bonds Investments', items: [] },
                { category: 'Bank Schemes - RD, FD & Other Deposits', items: [] },
                { category: 'Mutual Funds', items: [] },
                { category: 'Shares Information', items: [] }
            ];

            // Fetch data from Basic Details
            const basicDetailsResponse = await staticAPI.getBasicDetails();
            if (basicDetailsResponse.data && basicDetailsResponse.data.length > 0) {
                const basicData = basicDetailsResponse.data[0];
                
                // Add mutual funds from basic details
                if (basicData.mutualFunds && basicData.mutualFunds.length > 0) {
                    basicData.mutualFunds.forEach(mf => {
                        if (mf.mfName) {
                            options[3].items.push({
                                label: `${mf.mfName} (${mf.fundHouse || 'N/A'})`,
                                value: `MF: ${mf.mfName}`
                            });
                        }
                    });
                }

                // Add shares from basic details
                if (basicData.shares && basicData.shares.length > 0) {
                    basicData.shares.forEach(share => {
                        if (share.scriptName) {
                            options[4].items.push({
                                label: `${share.scriptName} (${share.dematCompany || 'N/A'})`,
                                value: `Share: ${share.scriptName}`
                            });
                        }
                    });
                }
            }

            // Fetch data from Investment API (Gold/SGB and Bank Schemes)
            try {
                const [goldSgbRes, bankSchemesRes, npsPpfRes] = await Promise.all([
                    investmentAPI.getAll('gold-sgb'),
                    investmentAPI.getAll('bank-schemes'),
                    investmentAPI.getAll('nps-ppf')
                ]);

                // Add NPS/PPF items from Investment API
                if (npsPpfRes.data && npsPpfRes.data.investments && npsPpfRes.data.investments.length > 0) {
                    npsPpfRes.data.investments.forEach(item => {
                        if (item.name) {
                            options[0].items.push({
                                label: `${item.name} (${item.type || 'N/A'})`,
                                value: `${item.type}: ${item.name}`
                            });
                        }
                    });
                }

                // Add Gold/SGB items from Investment API
                if (goldSgbRes.data && goldSgbRes.data.investments && goldSgbRes.data.investments.length > 0) {
                    goldSgbRes.data.investments.forEach(item => {
                        if (item.name) {
                            const displayType = item.purity || item.type || 'Gold';
                            options[1].items.push({
                                label: `${item.name} - ${displayType} (${item.provider || 'N/A'})`,
                                value: `Gold/SGB: ${item.name}`
                            });
                        }
                    });
                }

                // Add Bank Schemes from Investment API
                if (bankSchemesRes.data && bankSchemesRes.data.investments && bankSchemesRes.data.investments.length > 0) {
                    bankSchemesRes.data.investments.forEach(item => {
                        if (item.name) {
                            options[2].items.push({
                                label: `${item.name} - ${item.type || 'Bank Scheme'} (${item.source || 'N/A'})`,
                                value: `Bank Scheme: ${item.name}`
                            });
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching investment data:', error);
            }

            // Fetch data from Investment Profile API
            try {
                const [mutualFundsRes, sharesRes] = await Promise.all([
                    investmentProfileAPI.getMutualFunds(),
                    investmentProfileAPI.getShares()
                ]);

                // Add mutual funds from investment profile
                if (mutualFundsRes.data && mutualFundsRes.data.length > 0) {
                    mutualFundsRes.data.forEach(mf => {
                        if (mf.fundName) {
                            options[3].items.push({
                                label: `${mf.fundName} (${mf.fundHouse || 'N/A'})`,
                                value: `MF: ${mf.fundName}`
                            });
                        }
                    });
                }

                // Add shares from investment profile
                if (sharesRes.data && sharesRes.data.length > 0) {
                    sharesRes.data.forEach(share => {
                        if (share.companyName) {
                            options[4].items.push({
                                label: `${share.companyName} (${share.exchange || 'N/A'})`,
                                value: `Share: ${share.companyName}`
                            });
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching investment profile data:', error);
            }

            setInvestmentVehicleOptions(options);
        } catch (error) {
            console.error('Error fetching investment vehicle options:', error);
        }
    };

    const fetchMonthlyExpenses = async (months = 1) => {
        try {
            setLoadingExpenses(true);
            const response = await api.get(`/cashflow/monthly-expenses?months=${months}`);
            if (response.data.success) {
                setCalculatedMonthlyExpenses(response.data.data);
                return response.data.data;
            }
        } catch (error) {
            console.error('Error fetching monthly expenses:', error);
        } finally {
            setLoadingExpenses(false);
        }
        return null;
    };

    // Handle average months change
    const handleAverageMonthsChange = async (months) => {
        setAverageMonths(months);
        const newExpensesData = await fetchMonthlyExpenses(months);

        // Update form with new average immediately
        if (newExpensesData && targetForm.goalType === 'Emergency Fund') {
            const avgExpense = newExpensesData.averageExpenses?.toFixed(2) || newExpensesData.lastMonthExpenses?.toFixed(2) || '';
            setTargetForm(prev => ({
                ...prev,
                monthlyExpenses: avgExpense
            }));
        }
    };

    // Effect to calculate estimated cost for Emergency Fund
    useEffect(() => {
        if (targetForm.goalType === 'Emergency Fund') {
            const expenses = parseFloat(targetForm.monthlyExpenses) || 0;
            const months = parseFloat(targetForm.monthsOfCoverage) || 0;
            if (expenses > 0 && months > 0) {
                setTargetForm(prev => ({
                    ...prev,
                    estimatedCost: (expenses * months).toString()
                }));
            }
        }
    }, [targetForm.monthlyExpenses, targetForm.monthsOfCoverage, targetForm.goalType]);

    const handleGoalTypeChange = (e) => {
        const type = e.target.value;
        let updates = { goalType: type };

        if (type === 'Emergency Fund') {
            updates = {
                ...updates,
                specificGoal: 'Emergency Fund',
                recommendedInvestmentVehicle: ['High Yield Savings Account / Liquid Funds'],
                riskTolerance: 'Very Low',
                // Auto-populate monthly expenses from calculated data
                monthlyExpenses: calculatedMonthlyExpenses?.averageExpenses?.toFixed(2) || calculatedMonthlyExpenses?.lastMonthExpenses?.toFixed(2) || '',
                monthsOfCoverage: '6' // Default to 6 months
            };
        }

        setTargetForm(prev => ({
            ...prev,
            ...updates
        }));
    };

    const handleEmergencyFundOpen = () => {
        resetTargetForm();
        // Auto-populate with calculated expenses when opening Emergency Fund form
        setTargetForm(prev => ({
            ...prev,
            goalType: 'Emergency Fund',
            specificGoal: 'Emergency Fund',
            recommendedInvestmentVehicle: ['High Yield Savings Account / Liquid Funds'],
            riskTolerance: 'Very Low',
            monthlyExpenses: calculatedMonthlyExpenses?.averageExpenses?.toFixed(2) || calculatedMonthlyExpenses?.lastMonthExpenses?.toFixed(2) || '',
            monthsOfCoverage: '6'
        }));
        setShowEmergencyFundForm(true);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const targetsRes = await api.get('/budget/targets-for-life');
            setTargets(targetsRes.data || []);
        } catch (error) {
            console.error('Error fetching targets:', error);
        }
        setLoading(false);
    };


    const resetTargetForm = () => {
        setTargetForm({
            goalType: '',
            specificGoal: '',
            timeHorizon: '',
            estimatedCost: '',
            recommendedInvestmentVehicle: [],
            riskTolerance: '',
            targetDate: '',
            monthlyExpenses: '',
            monthsOfCoverage: ''
        });
        setEditingTarget(null);
        setShowDropdown(false);
    };

    const calculateTimeHorizon = (targetDate) => {
        if (!targetDate) return '';

        const today = new Date();
        const target = new Date(targetDate);
        const diffTime = target - today;
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

        if (diffYears < 1) {
            return '< 1 Year';
        } else if (diffYears >= 1 && diffYears < 3) {
            return '1-3 Years';
        } else if (diffYears >= 3 && diffYears < 5) {
            return '3-5 Years';
        } else if (diffYears >= 5 && diffYears < 10) {
            return '5-10 Years';
        } else if (diffYears >= 10 && diffYears < 15) {
            return '10-15 Years';
        } else if (diffYears >= 15 && diffYears < 20) {
            return '15-20 Years';
        } else {
            return '20+ Years';
        }
    };

    const calculateGoalType = (targetDate) => {
        if (!targetDate) return '';

        const today = new Date();
        const target = new Date(targetDate);
        const diffTime = target - today;
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

        if (diffYears <= 3) {
            return 'Short Term';
        } else if (diffYears <= 7) {
            return 'Medium Term';
        } else {
            return 'Long Term';
        }
    };

    const handleTargetDateChange = (dateValue) => {
        const calculatedHorizon = calculateTimeHorizon(dateValue);
        const calculatedGoalType = calculateGoalType(dateValue);
        setTargetForm({
            ...targetForm,
            targetDate: dateValue,
            timeHorizon: calculatedHorizon,
            goalType: calculatedGoalType
        });
    };


    const handleTargetSave = async () => {
        try {
            // Validate required fields
            if (!targetForm.goalType || !targetForm.specificGoal || !targetForm.timeHorizon ||
                !targetForm.estimatedCost || 
                !targetForm.recommendedInvestmentVehicle || 
                (Array.isArray(targetForm.recommendedInvestmentVehicle) && targetForm.recommendedInvestmentVehicle.length === 0) ||
                !targetForm.riskTolerance || !targetForm.targetDate) {
                alert('All fields are required');
                return;
            }

            if (parseFloat(targetForm.estimatedCost) <= 0) {
                alert('Estimated cost must be greater than 0');
                return;
            }

            const targetData = {
                goalType: targetForm.goalType,
                specificGoal: targetForm.specificGoal.trim(),
                timeHorizon: targetForm.timeHorizon.trim(),
                estimatedCost: parseFloat(targetForm.estimatedCost),
                recommendedInvestmentVehicle: Array.isArray(targetForm.recommendedInvestmentVehicle) 
                    ? targetForm.recommendedInvestmentVehicle 
                    : [targetForm.recommendedInvestmentVehicle].filter(Boolean),
                riskTolerance: targetForm.riskTolerance,
                targetDate: targetForm.targetDate,
                monthlyExpenses: targetForm.goalType === 'Emergency Fund' ? parseFloat(targetForm.monthlyExpenses) : undefined,
                monthsOfCoverage: targetForm.goalType === 'Emergency Fund' ? parseFloat(targetForm.monthsOfCoverage) : undefined
            };

            if (editingTarget) {
                await api.put(`/budget/targets-for-life/${editingTarget._id}`, targetData);
            } else {
                await api.post('/budget/targets-for-life', targetData);
            }

            fetchData();
            setShowTargetForm(false);
            resetTargetForm();
        } catch (error) {
            console.error('Error saving target:', error);
            alert(`Error saving target: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleTargetEdit = (target) => {
        setTargetForm({
            ...target,
            recommendedInvestmentVehicle: Array.isArray(target.recommendedInvestmentVehicle) 
                ? target.recommendedInvestmentVehicle 
                : [target.recommendedInvestmentVehicle].filter(Boolean),
            targetDate: target.targetDate ? new Date(target.targetDate).toISOString().split('T')[0] : ''
        });
        setEditingTarget(target);
        setShowTargetForm(true);
    };

    const handleTargetDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this target?')) {
            try {
                await api.delete(`/budget/targets-for-life/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting target:', error);
                alert('Error deleting target');
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

    const sortData = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedTargets = [...targets].sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];

            // Handle different data types
            if (key === 'estimatedCost') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            } else if (key === 'targetDate') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else {
                aVal = aVal?.toString().toLowerCase() || '';
                bVal = bVal?.toString().toLowerCase() || '';
            }

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setTargets(sortedTargets);
    };

    // Filter targets based on active tab
    const filteredTargets = activeTab === 'all'
        ? targets.filter(target => target.goalType !== 'Emergency Fund')
        : targets.filter(target => target.goalType === 'Emergency Fund');

    if (loading) {
        return <div className="loading">Loading data...</div>;
    }

    return (
        <div className="targets-life-container">
            <div className="section-header">
                <h2 className="page-title">Targets for Life</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="add-btn-premium"
                        onClick={() => {
                            resetTargetForm();
                            setShowTargetForm(true);
                        }}
                        style={{ marginRight: '1rem' }}
                    >
                        <span className="btn-icon">+</span>
                        Add New Goal
                    </button>
                    <button
                        className="add-btn-premium emergency-fund-btn"
                        onClick={handleEmergencyFundOpen}
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            marginRight: '1rem'
                        }}
                    >
                        <span className="btn-icon">🛡️</span>
                        Add Emergency Fund
                    </button>
                    <button
                        className="add-btn-premium budget-plan-btn"
                        onClick={() => setActiveTab('budget')}
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        }}
                    >
                        <span className="btn-icon">�</span>
                        Choose Budget Plan
                    </button>
                </div>
            </div>

            {showTargetForm && (
                <div className="modal-overlay">
                    <div className="modal-premium">
                        <div className="modal-header-premium">
                            <h3>{editingTarget ? 'Edit' : 'Add New'} Financial Goal</h3>
                            <button onClick={() => setShowTargetForm(false)} className="close-btn-premium">×</button>
                        </div>

                        <div className="target-form-premium">
                            <div className="form-grid">
                                <div className="form-group-premium">
                                    <label>Target Date <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        value={targetForm.targetDate}
                                        onChange={(e) => handleTargetDateChange(e.target.value)}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group-premium">
                                    <label>Specific Goal <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={targetForm.specificGoal}
                                        onChange={(e) => setTargetForm({ ...targetForm, specificGoal: e.target.value })}
                                        placeholder="e.g., Vacation Fund, Retirement"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group-premium">
                                    <label>Time Horizon <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={targetForm.timeHorizon}
                                        readOnly
                                        placeholder="Auto-calculated from Target Date"
                                        className="form-input"
                                        style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                                    />
                                </div>

                                <div className="form-group-premium">
                                    <label>Estimated Cost <span className="required">*</span></label>
                                    <div className="input-with-prefix">
                                        <span className="input-prefix">$</span>
                                        <input
                                            type="number"
                                            value={targetForm.estimatedCost}
                                            onChange={(e) => setTargetForm({ ...targetForm, estimatedCost: e.target.value })}
                                            placeholder="0.00"
                                            className="form-input with-prefix"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-group-premium">
                                    <label>Recommended Investment Vehicle <span className="required">*</span></label>
                                    <div className="multi-select-dropdown">
                                        <div 
                                            className="multi-select-input"
                                            onClick={() => setShowDropdown(!showDropdown)}
                                        >
                                            <div className="selected-items">
                                                {targetForm.recommendedInvestmentVehicle && targetForm.recommendedInvestmentVehicle.length > 0 ? (
                                                    targetForm.recommendedInvestmentVehicle.map((item, index) => (
                                                        <span key={index} className="selected-tag">
                                                            {item}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setTargetForm({
                                                                        ...targetForm,
                                                                        recommendedInvestmentVehicle: targetForm.recommendedInvestmentVehicle.filter((_, i) => i !== index)
                                                                    });
                                                                }}
                                                                className="remove-tag"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="placeholder">Select investment vehicles...</span>
                                                )}
                                            </div>
                                            <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
                                        </div>
                                        {showDropdown && (
                                            <div className="dropdown-options">
                                                {investmentVehicleOptions.map((category, catIndex) => (
                                                    <div key={catIndex} className="option-category">
                                                        <div className="category-header">{category.category}</div>
                                                        {category.items.length > 0 ? (
                                                            category.items.map((item, itemIndex) => (
                                                                <label key={itemIndex} className="option-item">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={targetForm.recommendedInvestmentVehicle.includes(item.value)}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setTargetForm({
                                                                                    ...targetForm,
                                                                                    recommendedInvestmentVehicle: [...targetForm.recommendedInvestmentVehicle, item.value]
                                                                                });
                                                                            } else {
                                                                                setTargetForm({
                                                                                    ...targetForm,
                                                                                    recommendedInvestmentVehicle: targetForm.recommendedInvestmentVehicle.filter(v => v !== item.value)
                                                                                });
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span>{item.label}</span>
                                                                </label>
                                                            ))
                                                        ) : (
                                                            <div className="no-items">No items available</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group-premium">
                                    <label>Goal Type <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={targetForm.goalType}
                                        readOnly
                                        placeholder="Auto-calculated from Target Date"
                                        className="form-input"
                                        style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                                    />
                                </div>

                                <div className="form-group-premium">
                                    <label>Risk Tolerance <span className="required">*</span></label>
                                    <select
                                        value={targetForm.riskTolerance}
                                        onChange={(e) => setTargetForm({ ...targetForm, riskTolerance: e.target.value })}
                                        className="form-select"
                                    >
                                        <option value="">Select Risk Level</option>
                                        <option value="Very Low">Very Low</option>
                                        <option value="Low">Low</option>
                                        <option value="Low to Medium">Low to Medium</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Medium to High">Medium to High</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-actions-premium">
                                <button onClick={handleTargetSave} className="save-btn-premium">
                                    {editingTarget ? 'Update' : 'Save'} Goal
                                </button>
                                <button
                                    onClick={() => setShowTargetForm(false)}
                                    className="cancel-btn-premium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency Fund Form Modal */}
            {showEmergencyFundForm && (
                <div className="modal-overlay">
                    <div className="modal-premium">
                        <div className="modal-header-premium" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            <h3 style={{ color: 'white' }}>🛡️ Add Emergency Fund</h3>
                            <button onClick={() => setShowEmergencyFundForm(false)} className="close-btn-premium">×</button>
                        </div>

                        <div className="target-form-premium">
                            <div className="form-grid">
                                <div className="form-group-premium">
                                    <label>Calculate Average From <span className="required">*</span></label>
                                    <select
                                        value={averageMonths}
                                        onChange={(e) => handleAverageMonthsChange(parseInt(e.target.value))}
                                        className="form-input"
                                        style={{ marginBottom: '12px' }}
                                    >
                                        <option value={1}>Last 1 Month</option>
                                        <option value={2}>Last 2 Months Average</option>
                                        <option value={3}>Last 3 Months Average</option>
                                        <option value={4}>Last 4 Months Average</option>
                                        <option value={5}>Last 5 Months Average</option>
                                        <option value={6}>Last 6 Months Average</option>
                                        <option value={12}>Last 12 Months Average</option>
                                    </select>
                                    <small style={{ color: '#6b7280', fontSize: '0.875rem', display: 'block' }}>
                                        {loadingExpenses ? (
                                            '⏳ Calculating average from your transactions...'
                                        ) : calculatedMonthlyExpenses ? (
                                            <>
                                                📊 Calculated from {averageMonths} month{averageMonths > 1 ? 's' : ''} of data
                                            </>
                                        ) : (
                                            'Select how many months to average'
                                        )}
                                    </small>
                                </div>

                                <div className="form-group-premium">
                                    <label>Months of Coverage <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        value={targetForm.monthsOfCoverage}
                                        onChange={(e) => setTargetForm({ ...targetForm, monthsOfCoverage: e.target.value })}
                                        placeholder="e.g. 6"
                                        className="form-input"
                                        step="1"
                                        min="1"
                                    />
                                    <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                                        Recommended: 3-6 months
                                    </small>
                                </div>

                                <div className="form-group-premium">
                                    <label>Present Monthly Average Expenses</label>
                                    <div className="input-with-prefix">
                                        <span className="input-prefix">$</span>
                                        <input
                                            type="text"
                                            value={calculatedMonthlyExpenses?.averageExpenses?.toFixed(2) || calculatedMonthlyExpenses?.lastMonthExpenses?.toFixed(2) || '0.00'}
                                            readOnly
                                            className="form-input with-prefix"
                                            style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                    <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                                        Average from {averageMonths} month(s) data
                                    </small>
                                </div>

                                <div className="form-group-premium">
                                    <label>Want Monthly Expenses</label>
                                    <div className="input-with-prefix">
                                        <span className="input-prefix">$</span>
                                        <input
                                            type="number"
                                            value={targetForm.monthlyExpenses}
                                            onChange={(e) => setTargetForm({ ...targetForm, monthlyExpenses: e.target.value })}
                                            placeholder="0.00"
                                            className="form-input with-prefix"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                    <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                                        Enter monthly expenses as per your need
                                    </small>
                                </div>

                                {targetForm.monthsOfCoverage && (
                                    <div className="form-group-premium full-width" style={{
                                        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '2px solid #10b981'
                                    }}>
                                        <label style={{ color: '#059669', fontWeight: '600', marginBottom: '8px' }}>
                                            💰 Total Emergency Fund Required
                                        </label>
                                        <div style={{
                                            fontSize: '1.75rem',
                                            fontWeight: 'bold',
                                            color: '#047857',
                                            marginTop: '8px'
                                        }}>
                                            {(() => {
                                                const manualExpenses = parseFloat(targetForm.monthlyExpenses) || 0;
                                                const autoExpenses = calculatedMonthlyExpenses?.averageExpenses || calculatedMonthlyExpenses?.lastMonthExpenses || 0;
                                                const finalExpenses = Math.max(manualExpenses, autoExpenses);
                                                return formatCurrency(finalExpenses * parseFloat(targetForm.monthsOfCoverage || 0));
                                            })()}
                                        </div>
                                        <small style={{ color: '#059669', display: 'block', marginTop: '8px' }}>
                                            {(() => {
                                                const manualExpenses = parseFloat(targetForm.monthlyExpenses) || 0;
                                                const autoExpenses = calculatedMonthlyExpenses?.averageExpenses || calculatedMonthlyExpenses?.lastMonthExpenses || 0;
                                                const finalExpenses = Math.max(manualExpenses, autoExpenses);
                                                const source = finalExpenses === manualExpenses && manualExpenses > 0 ? 'Using manual input' : 'Using monthly average';
                                                return `${source} (higher): $${finalExpenses.toFixed(2)} × ${targetForm.monthsOfCoverage} months`;
                                            })()}
                                        </small>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions-premium">
                                <button
                                    onClick={async () => {
                                        try {
                                            const manualExpenses = parseFloat(targetForm.monthlyExpenses) || 0;
                                            const autoExpenses = calculatedMonthlyExpenses?.averageExpenses || calculatedMonthlyExpenses?.lastMonthExpenses || 0;
                                            const expenses = Math.max(manualExpenses, autoExpenses);
                                            const months = parseFloat(targetForm.monthsOfCoverage);

                                            if (!months || months <= 0) {
                                                alert('Please specify months of coverage');
                                                return;
                                            }

                                            if (expenses <= 0) {
                                                alert('Monthly expenses must be greater than 0');
                                                return;
                                            }

                                            const emergencyFundData = {
                                                goalType: 'Emergency Fund',
                                                specificGoal: 'Emergency Fund',
                                                timeHorizon: '< 1 Year',
                                                estimatedCost: expenses * months,
                                                recommendedInvestmentVehicle: 'High Yield Savings Account / Liquid Funds',
                                                riskTolerance: 'Very Low',
                                                targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                                                monthlyExpenses: expenses,
                                                monthsOfCoverage: months
                                            };

                                            await api.post('/budget/targets-for-life', emergencyFundData);
                                            fetchData();
                                            setShowEmergencyFundForm(false);
                                            resetTargetForm();
                                        } catch (error) {
                                            console.error('Error saving emergency fund:', error);
                                            alert(`Error saving emergency fund: ${error.response?.data?.message || error.message}`);
                                        }
                                    }}
                                    className="save-btn-premium"
                                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                                >
                                    Save Emergency Fund
                                </button>
                                <button
                                    onClick={() => setShowEmergencyFundForm(false)}
                                    className="cancel-btn-premium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigator */}
            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        📊 All Goals
                    </button>
                    <button
                        className={`tab ${activeTab === 'emergency' ? 'active' : ''}`}
                        onClick={() => setActiveTab('emergency')}
                    >
                        🛡️ Emergency Fund
                    </button>
                    <button
                        className={`tab ${activeTab === 'budget' ? 'active' : ''}`}
                        onClick={() => setActiveTab('budget')}
                    >
                        💰 Budget Plan
                    </button>
                </div>
            </div>

            {/* Targets Table */}
            {activeTab !== 'budget' ? (
                <div className="targets-table-container">
                    {filteredTargets.length === 0 ? (
                        <div className="no-targets-premium">
                            <div className="empty-state">
                                <h3>🎯 No {activeTab === 'emergency' ? 'Emergency Funds' : 'Financial Goals'} Yet</h3>
                                <p>Start planning your financial future by adding your first {activeTab === 'emergency' ? 'emergency fund' : 'goal'}</p>
                                <button
                                    className="add-btn-premium"
                                    onClick={() => {
                                        resetTargetForm();
                                        activeTab === 'emergency' ? setShowEmergencyFundForm(true) : setShowTargetForm(true);
                                    }}
                                >
                                    <span className="btn-icon">+</span>
                                    Create Your First {activeTab === 'emergency' ? 'Emergency Fund' : 'Goal'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            {activeTab === 'all' ? (
                                <table className="targets-table-premium">
                                    <thead>
                                        <tr>
                                            <th onClick={() => sortData('goalType')} className="sortable">
                                                Goal Type {sortConfig.key === 'goalType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => sortData('specificGoal')} className="sortable">
                                                Specific Goal {sortConfig.key === 'specificGoal' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => sortData('timeHorizon')} className="sortable">
                                                Time Horizon {sortConfig.key === 'timeHorizon' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => sortData('estimatedCost')} className="sortable">
                                                Estimated Cost {sortConfig.key === 'estimatedCost' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="investment-col">
                                                Recommended Investment Vehicle
                                            </th>
                                            <th onClick={() => sortData('riskTolerance')} className="sortable">
                                                Risk Tolerance {sortConfig.key === 'riskTolerance' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => sortData('targetDate')} className="sortable">
                                                Target Date {sortConfig.key === 'targetDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="actions-col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTargets
                                            .filter(target => target.goalType && target.specificGoal && target.riskTolerance)
                                            .map((target) => (
                                                <tr key={target._id} className="table-row-premium">
                                                    <td>
                                                        <span className={`goal-type-badge ${target.goalType?.toLowerCase().replace(' ', '-') || ''}`}>
                                                            {target.goalType || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="specific-goal">{target.specificGoal || 'N/A'}</td>
                                                    <td>{target.timeHorizon || 'N/A'}</td>
                                                    <td className="cost-cell">{target.estimatedCost ? formatCurrency(target.estimatedCost) : '$0.00'}</td>
                                                    <td className="investment-cell">
                                                        {Array.isArray(target.recommendedInvestmentVehicle) 
                                                            ? target.recommendedInvestmentVehicle.join(', ') 
                                                            : target.recommendedInvestmentVehicle || 'N/A'}
                                                    </td>
                                                    <td>
                                                        <span className={`risk-badge ${target.riskTolerance?.toLowerCase().replace(/\s+/g, '-').replace('to', '') || ''}`}>
                                                            {target.riskTolerance || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>{target.targetDate ? formatDate(target.targetDate) : 'N/A'}</td>
                                                    <td className="actions-cell">
                                                        <button
                                                            className="action-btn edit"
                                                            onClick={() => handleTargetEdit(target)}
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => handleTargetDelete(target._id)}
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="targets-table-premium">
                                    <thead>
                                        <tr>
                                            <th onClick={() => sortData('monthlyExpenses')} className="sortable">
                                                Monthly Expenses {sortConfig.key === 'monthlyExpenses' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => sortData('monthsOfCoverage')} className="sortable">
                                                Months of Coverage {sortConfig.key === 'monthsOfCoverage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => sortData('estimatedCost')} className="sortable">
                                                Total Required {sortConfig.key === 'estimatedCost' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="actions-col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTargets
                                            .filter(target => target.goalType && target.specificGoal && target.riskTolerance)
                                            .map((target) => (
                                                <tr key={target._id} className="table-row-premium">
                                                    <td className="cost-cell">{target.monthlyExpenses ? formatCurrency(target.monthlyExpenses) : '$0.00'}</td>
                                                    <td>{target.monthsOfCoverage || 'N/A'} months</td>
                                                    <td className="cost-cell" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                        {target.estimatedCost ? formatCurrency(target.estimatedCost) : '$0.00'}
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => handleTargetDelete(target._id)}
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <BudgetPlanTab />
            )
            }
        </div >
    );
};

export default TargetsForLife;
