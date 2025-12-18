import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './MonitoringPages.css';

const TargetsForLife = () => {
    const [loading, setLoading] = useState(false);
    const [targets, setTargets] = useState([]);
    const [showTargetForm, setShowTargetForm] = useState(false);
    const [editingTarget, setEditingTarget] = useState(null);
    const [targetForm, setTargetForm] = useState({
        totalSavingsTarget: '',
        targetDescription: '',
        purchases: [
            { itemName: '', itemCost: '', itemType: 'purchase' }
        ],
        savings: [
            { itemName: '', itemAmount: '', itemType: 'savings' }
        ]
    });

    useEffect(() => {
        fetchData();
    }, []);

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
            totalSavingsTarget: '',
            targetDescription: '',
            purchases: [
                { itemName: '', itemCost: '', itemType: 'purchase' }
            ],
            savings: [
                { itemName: '', itemAmount: '', itemType: 'savings' }
            ]
        });
        setEditingTarget(null);
    };

    const addPurchaseItem = () => {
        setTargetForm({
            ...targetForm,
            purchases: [
                ...targetForm.purchases,
                { itemName: '', itemCost: '', itemType: 'purchase' }
            ]
        });
    };

    const removePurchaseItem = (index) => {
        if (targetForm.purchases.length <= 1) return;
        const newPurchases = [...targetForm.purchases];
        newPurchases.splice(index, 1);
        setTargetForm({ ...targetForm, purchases: newPurchases });
    };

    const updatePurchaseItem = (index, field, value) => {
        const newPurchases = [...targetForm.purchases];
        newPurchases[index] = { ...newPurchases[index], [field]: value };
        setTargetForm({ ...targetForm, purchases: newPurchases });
    };

    const addSavingsItem = () => {
        setTargetForm({
            ...targetForm,
            savings: [
                ...targetForm.savings,
                { itemName: '', itemAmount: '', itemType: 'savings' }
            ]
        });
    };

    const removeSavingsItem = (index) => {
        if (targetForm.savings.length <= 1) return;
        const newSavings = [...targetForm.savings];
        newSavings.splice(index, 1);
        setTargetForm({ ...targetForm, savings: newSavings });
    };

    const updateSavingsItem = (index, field, value) => {
        const newSavings = [...targetForm.savings];
        newSavings[index] = { ...newSavings[index], [field]: value };
        setTargetForm({ ...targetForm, savings: newSavings });
    };

    const calculateTotalPurchases = () => {
        return targetForm.purchases.reduce((total, item) => {
            return total + (parseFloat(item.itemCost) || 0);
        }, 0).toFixed(2);
    };

    const calculateTotalSavings = () => {
        return targetForm.savings.reduce((total, item) => {
            return total + (parseFloat(item.itemAmount) || 0);
        }, 0).toFixed(2);
    };

    const handleTargetSave = async () => {
        try {
            // Validate required fields
            if (!targetForm.targetDescription.trim()) {
                alert('Target description is required');
                return;
            }

            if (!targetForm.totalSavingsTarget || parseFloat(targetForm.totalSavingsTarget) <= 0) {
                alert('Total savings target must be greater than 0');
                return;
            }

            // Prepare the data to match the Target model schema
            const targetData = {
                totalSavingsTarget: parseFloat(targetForm.totalSavingsTarget) || 0,
                targetDescription: targetForm.targetDescription.trim(),
                purchases: targetForm.purchases
                    .filter(item => item.itemName && item.itemCost)
                    .map(item => ({
                        itemName: item.itemName,
                        itemCost: parseFloat(item.itemCost) || 0
                    })),
                savings: targetForm.savings
                    .filter(item => item.itemName && item.itemAmount)
                    .map(item => ({
                        itemName: item.itemName,
                        itemAmount: parseFloat(item.itemAmount) || 0
                    }))
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
        setTargetForm(target);
        setEditingTarget(target);
        setShowTargetForm(true);
    };

    const handleTargetDelete = async (id) => {
        if (confirm('Are you sure you want to delete this target?')) {
            try {
                await api.delete(`/budget/targets-for-life/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting target:', error);
                alert('Error deleting target');
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading data...</div>;
    }

    return (
        <div className="monitoring-container">
            <div className="section-header">
                <h2>Targets for Life</h2>
                <button
                    className="add-btn"
                    onClick={() => {
                        resetTargetForm();
                        setShowTargetForm(true);
                    }}
                >
                    Add Target
                </button>
            </div>

            {showTargetForm && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3>{editingTarget ? 'Edit' : 'Add'} Financial Target</h3>
                            <button onClick={() => setShowTargetForm(false)} className="close-btn">×</button>
                        </div>

                        <div className="target-form">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div className="form-group">
                                    <label>Total Savings Target (₹)</label>
                                    <input
                                        type="number"
                                        value={targetForm.totalSavingsTarget}
                                        onChange={(e) => setTargetForm({ ...targetForm, totalSavingsTarget: e.target.value })}
                                        placeholder="Enter total amount"
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Target Description</label>
                                    <input
                                        type="text"
                                        value={targetForm.targetDescription}
                                        onChange={(e) => setTargetForm({ ...targetForm, targetDescription: e.target.value })}
                                        placeholder="E.g., Retirement, House Down Payment"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            <div className="target-section">
                                <div className="section-header">
                                    <h4>Planned Purchases</h4>
                                    <button type="button" className="add-btn" onClick={addPurchaseItem}>
                                        + Add Purchase
                                    </button>
                                </div>

                                {targetForm.purchases.map((purchase, index) => (
                                    <div key={`purchase-${index}`} className="item-row">
                                        <input
                                            type="text"
                                            value={purchase.itemName}
                                            onChange={(e) => updatePurchaseItem(index, 'itemName', e.target.value)}
                                            placeholder="Item name"
                                        />
                                        <input
                                            type="number"
                                            value={purchase.itemCost}
                                            onChange={(e) => updatePurchaseItem(index, 'itemCost', e.target.value)}
                                            placeholder="Cost (₹)"
                                        />
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removePurchaseItem(index)}
                                            disabled={targetForm.purchases.length <= 1}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="target-section">
                                <div className="section-header">
                                    <h4>Planned Savings</h4>
                                    <button type="button" className="add-btn" onClick={addSavingsItem}>
                                        + Add Savings Goal
                                    </button>
                                </div>

                                {targetForm.savings.map((saving, index) => (
                                    <div key={`saving-${index}`} className="item-row">
                                        <input
                                            type="text"
                                            value={saving.itemName}
                                            onChange={(e) => updateSavingsItem(index, 'itemName', e.target.value)}
                                            placeholder="Savings goal name"
                                        />
                                        <input
                                            type="number"
                                            value={saving.itemAmount}
                                            onChange={(e) => updateSavingsItem(index, 'itemAmount', e.target.value)}
                                            placeholder="Amount to save (₹)"
                                        />
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeSavingsItem(index)}
                                            disabled={targetForm.savings.length <= 1}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-section" style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
                                <h4>Summary</h4>
                                <p>Total Savings Target: ₹{targetForm.totalSavingsTarget || '0'}</p>
                                <p>Total Allocated to Purchases: ₹{calculateTotalPurchases()}</p>
                                <p>Total Allocated to Savings: ₹{calculateTotalSavings()}</p>
                                <p style={{ fontWeight: 'bold', color: (parseFloat(calculateTotalPurchases()) + parseFloat(calculateTotalSavings())) > (parseFloat(targetForm.totalSavingsTarget) || 0) ? 'red' : 'green' }}>
                                    Remaining: ₹{((parseFloat(targetForm.totalSavingsTarget) || 0) - parseFloat(calculateTotalPurchases()) - parseFloat(calculateTotalSavings())).toFixed(2)}
                                </p>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '20px' }}>
                                <button onClick={handleTargetSave} className="save-btn">
                                    {editingTarget ? 'Update' : 'Save'} Target
                                </button>
                                <button
                                    onClick={() => setShowTargetForm(false)}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Targets List */}
            <div className="targets-container">
                {targets.length === 0 ? (
                    <div className="no-targets">
                        <p>No financial targets found.</p>
                        <button
                            className="add-target-btn"
                            onClick={() => {
                                resetTargetForm();
                                setShowTargetForm(true);
                            }}
                        >
                            + Create Your First Target
                        </button>
                    </div>
                ) : (
                    <div className="targets-grid">
                        {targets.map((target) => {
                            const totalAllocated = (target.purchases || []).reduce((sum, p) => sum + (parseFloat(p.itemCost) || 0), 0) +
                                (target.savings || []).reduce((sum, s) => sum + (parseFloat(s.itemAmount) || 0), 0);
                            const progress = Math.min(100, (totalAllocated / (parseFloat(target.totalSavingsTarget) || 1)) * 100);
                            const purchaseCount = (target.purchases || []).filter(p => p.itemName).length;
                            const savingsCount = (target.savings || []).filter(s => s.itemName).length;

                            return (
                                <div key={target._id} className="target-card">
                                    <div className="target-card-header">
                                        <h3>{target.targetDescription}</h3>
                                        <div className="target-actions">
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTargetEdit(target);
                                                }}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="icon-btn delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTargetDelete(target._id);
                                                }}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    <div className="target-amount">
                                        <div className="total-target">
                                            <span>Total Target</span>
                                            <strong>₹{parseFloat(target.totalSavingsTarget).toLocaleString('en-IN')}</strong>
                                        </div>
                                        <div className="progress-container">
                                            <div
                                                className="progress-bar"
                                                style={{ width: `${progress}%` }}
                                                title={`${progress.toFixed(1)}% of target allocated`}
                                            ></div>
                                        </div>
                                        <div className="progress-text">
                                            <span>Allocated: ₹{totalAllocated.toLocaleString('en-IN')}</span>
                                            <span>{progress.toFixed(1)}%</span>
                                        </div>
                                    </div>

                                    <div className="target-details">
                                        <div className="detail-section">
                                            <div className="detail-header">
                                                <h4>Purchases ({purchaseCount})</h4>
                                            </div>
                                            {purchaseCount > 0 ? (
                                                <ul className="items-list">
                                                    {target.purchases
                                                        .filter(p => p.itemName)
                                                        .map((purchase, idx) => (
                                                            <li key={`purchase-${idx}`} className="item-row">
                                                                <span className="item-name">{purchase.itemName}</span>
                                                                <span className="item-amount">₹{parseFloat(purchase.itemCost || 0).toLocaleString('en-IN')}</span>
                                                            </li>
                                                        ))}
                                                </ul>
                                            ) : (
                                                <div className="no-items">No purchases added</div>
                                            )}
                                        </div>

                                        <div className="detail-section">
                                            <div className="detail-header">
                                                <h4>Savings Goals ({savingsCount})</h4>
                                            </div>
                                            {savingsCount > 0 ? (
                                                <ul className="items-list">
                                                    {target.savings
                                                        .filter(s => s.itemName)
                                                        .map((saving, idx) => (
                                                            <li key={`saving-${idx}`} className="item-row">
                                                                <span className="item-name">{saving.itemName}</span>
                                                                <span className="item-amount">₹{parseFloat(saving.itemAmount || 0).toLocaleString('en-IN')}</span>
                                                            </li>
                                                        ))}
                                                </ul>
                                            ) : (
                                                <div className="no-items">No savings goals added</div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        className="view-details-btn"
                                        onClick={() => handleTargetEdit(target)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {targets.length > 0 && (
                    <button
                        className="add-target-btn floating"
                        onClick={() => {
                            resetTargetForm();
                            setShowTargetForm(true);
                        }}
                    >
                        + Add New Target
                    </button>
                )}
            </div>
        </div>
    );
};

export default TargetsForLife;
