import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import BudgetPlanTab from './BudgetPlanTab';
import './TargetsForLife.css';
import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

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
        recommendedInvestmentVehicle: '',
        riskTolerance: '',
        targetDate: '',
        monthlyExpenses: '',
        monthsOfCoverage: ''
    });

    useEffect(() => {
    trackFeatureUsage('/family/monitoring/targets-for-life', 'view');
        fetchData();
    }, []);

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
                recommendedInvestmentVehicle: 'High Yield Savings Account / Liquid Funds',
                riskTolerance: 'Very Low'
            };
        }

        setTargetForm(prev => ({
            ...prev,
            ...updates
        }));
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
            recommendedInvestmentVehicle: '',
            riskTolerance: '',
            targetDate: '',
            monthlyExpenses: '',
            monthsOfCoverage: ''
        });
        setEditingTarget(null);
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

    const handleTargetDateChange = (dateValue) => {
        const calculatedHorizon = calculateTimeHorizon(dateValue);
        setTargetForm({
            ...targetForm,
            targetDate: dateValue,
            timeHorizon: calculatedHorizon
        });
    };


    const handleTargetSave = async () => {
        try {
            // Validate required fields
            if (!targetForm.goalType || !targetForm.specificGoal || !targetForm.timeHorizon ||
                !targetForm.estimatedCost || !targetForm.recommendedInvestmentVehicle ||
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
                recommendedInvestmentVehicle: targetForm.recommendedInvestmentVehicle.trim(),
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
                        onClick={() => {
                            resetTargetForm();
                            setShowEmergencyFundForm(true);
                        }}
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
                                    <label>Goal Type <span className="required">*</span></label>
                                    <select
                                        value={targetForm.goalType}
                                        onChange={handleGoalTypeChange}
                                        className="form-select"
                                    >
                                        <option value="">Select Goal Type</option>
                                        <option value="Short Term">Short Term</option>
                                        <option value="Medium Term">Medium Term</option>
                                        <option value="Long Term">Long Term</option>
                                    </select>
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

                                <div className="form-group-premium full-width">
                                    <label>Recommended Investment Vehicle <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={targetForm.recommendedInvestmentVehicle}
                                        onChange={(e) => setTargetForm({ ...targetForm, recommendedInvestmentVehicle: e.target.value })}
                                        placeholder="e.g., High-Yield Savings Account, ETFs"
                                        className="form-input"
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

                                <div className="form-group-premium">
                                    <label>Target Date <span className="required">*</span></label>
                                    <input
                                        type="date"
                                        value={targetForm.targetDate}
                                        onChange={(e) => handleTargetDateChange(e.target.value)}
                                        className="form-input"
                                    />
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
                                    <label>Monthly Expenses <span className="required">*</span></label>
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
                                        Average monthly household expenses
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

                                {targetForm.monthlyExpenses && targetForm.monthsOfCoverage && (
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
                                            {formatCurrency(parseFloat(targetForm.monthlyExpenses) * parseFloat(targetForm.monthsOfCoverage))}
                                        </div>
                                        <small style={{ color: '#059669', display: 'block', marginTop: '8px' }}>
                                            ${parseFloat(targetForm.monthlyExpenses).toFixed(2)} × {targetForm.monthsOfCoverage} months
                                        </small>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions-premium">
                                <button
                                    onClick={async () => {
                                        try {
                                            if (!targetForm.monthlyExpenses || !targetForm.monthsOfCoverage) {
                                                alert('Please fill in all required fields');
                                                return;
                                            }

                                            const expenses = parseFloat(targetForm.monthlyExpenses);
                                            const months = parseFloat(targetForm.monthsOfCoverage);

                                            if (expenses <= 0 || months <= 0) {
                                                alert('Values must be greater than 0');
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
                                                    <td className="investment-cell">{target.recommendedInvestmentVehicle || 'N/A'}</td>
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
            )}
        </div>
    );
};

export default TargetsForLife;
