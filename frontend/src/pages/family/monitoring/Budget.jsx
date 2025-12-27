import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './Budget.css';
import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const Budget = () => {
  const [activeTab, setActiveTab] = useState('cheque-register');
  const [loading, setLoading] = useState(false);

  // Cheque Register State
  const [chequeRecords, setChequeRecords] = useState([]);
  const [showChequeForm, setShowChequeForm] = useState(false);
  const [editingCheque, setEditingCheque] = useState(null);
  const [chequeForm, setChequeForm] = useState({
    receivedDate: new Date().toISOString().split('T')[0],
    chequeDepositDate: '',
    difference: '',
    reasonForDelay: '',
    chequePartyDetails: '',
    accountHead: '',
    deposit: '',
    withdrawal: '',
    amount: '',
    bank: '',
    chequeNumber: '',
    chequeDepositedInBank: '',
    receivedFor: '',
    receivedBy: ''
  });

  // Daily Cash Register State
  const [cashRecords, setCashRecords] = useState([]);
  const [showCashForm, setShowCashForm] = useState(false);
  const [editingCash, setEditingCash] = useState(null);
  const [cashForm, setCashForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    credit: '',
    debit: '',
    balance: '',
    category: '',
    affectedAccount: '',
    additionalDetails: ''
  });

  // Targets for Life State
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
  const [milestones, setMilestones] = useState([]);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'planning',
    priority: 'medium',
    assignedTo: '',
    progress: 0,
    tasks: []
  });

  useEffect(() => {
    trackFeatureUsage('/family/monitoring/budget', 'view');
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [chequeRes, cashRes, milestoneRes, targetsRes] = await Promise.all([
        api.get('/budget/cheque-register'),
        api.get('/budget/daily-cash'),
        api.get('/budget/milestones'),
        api.get('/budget/targets-for-life')
      ]);
      
      setChequeRecords(chequeRes.data || []);
      setCashRecords(cashRes.data || []);
      setMilestones(milestoneRes.data || []);
      setTargets(targetsRes.data || []);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    }
    setLoading(false);
  };

  // Cheque Register Functions
  const resetChequeForm = () => {
    setChequeForm({
      receivedDate: new Date().toISOString().split('T')[0],
      chequeDepositDate: '',
      difference: '',
      reasonForDelay: '',
      chequePartyDetails: '',
      accountHead: '',
      deposit: '',
      withdrawal: '',
      amount: '',
      bank: '',
      chequeNumber: '',
      chequeDepositedInBank: '',
      receivedFor: '',
      receivedBy: ''
    });
    setEditingCheque(null);
  };

  const handleChequeSave = async () => {
    try {
      if (editingCheque) {
        await api.put(`/budget/cheque-register/${editingCheque._id}`, chequeForm);
      } else {
        await api.post('/budget/cheque-register', chequeForm);
      }
      fetchData();
      setShowChequeForm(false);
      resetChequeForm();
    } catch (error) {
      console.error('Error saving cheque record:', error);
      alert('Error saving cheque record');
    }
  };

  const handleChequeEdit = (record) => {
    setChequeForm(record);
    setEditingCheque(record);
    setShowChequeForm(true);
  };

  const handleChequeDelete = async (id) => {
    if (confirm('Are you sure you want to delete this cheque record?')) {
      try {
        await api.delete(`/budget/cheque-register/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting cheque record:', error);
        alert('Error deleting cheque record');
      }
    }
  };

  // Daily Cash Register Functions
  const resetCashForm = () => {
    setCashForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      credit: '',
      debit: '',
      balance: '',
      category: '',
      affectedAccount: '',
      additionalDetails: ''
    });
    setEditingCash(null);
  };

  const handleCashSave = async () => {
    try {
      if (editingCash) {
        await api.put(`/budget/daily-cash/${editingCash._id}`, cashForm);
      } else {
        await api.post('/budget/daily-cash', cashForm);
      }
      fetchData();
      setShowCashForm(false);
      resetCashForm();
    } catch (error) {
      console.error('Error saving cash record:', error);
      alert('Error saving cash record');
    }
  };

  const handleCashEdit = (record) => {
    setCashForm(record);
    setEditingCash(record);
    setShowCashForm(true);
  };

  const handleCashDelete = async (id) => {
    if (confirm('Are you sure you want to delete this cash record?')) {
      try {
        await api.delete(`/budget/daily-cash/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting cash record:', error);
        alert('Error deleting cash record');
      }
    }
  };

  // Targets for Life Functions
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

  // Milestone Functions
  const resetMilestoneForm = () => {
    setMilestoneForm({
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'planning',
      priority: 'medium',
      assignedTo: '',
      progress: 0,
      tasks: []
    });
    setEditingMilestone(null);
  };

  const handleMilestoneSave = async () => {
    try {
      if (editingMilestone) {
        await api.put(`/budget/milestones/${editingMilestone._id}`, milestoneForm);
      } else {
        await api.post('/budget/milestones', milestoneForm);
      }
      fetchData();
      setShowMilestoneForm(false);
      resetMilestoneForm();
    } catch (error) {
      console.error('Error saving milestone:', error);
      alert('Error saving milestone');
    }
  };

  const handleMilestoneEdit = (record) => {
    setMilestoneForm(record);
    setEditingMilestone(record);
    setShowMilestoneForm(true);
  };

  const handleMilestoneDelete = async (id) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      try {
        await api.delete(`/budget/milestones/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting milestone:', error);
        alert('Error deleting milestone');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading budget data...</div>;
  }

  return (
    <div className="budget-container">
      <h1>Budget Management</h1>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'cheque-register' ? 'active' : ''}`}
          onClick={() => setActiveTab('cheque-register')}
        >
          Cheque Register
        </button>
        <button
          className={`tab-btn ${activeTab === 'daily-cash' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily-cash')}
        >
          Daily Cash Register
        </button>
        <button
          className={`tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          Milestone & Task Timeline
        </button>
        <button
          className={`tab-btn ${activeTab === 'targets-for-life' ? 'active' : ''}`}
          onClick={() => setActiveTab('targets-for-life')}
        >
          Targets for Life
        </button>
      </div>

      {/* Targets for Life Tab */}
      {activeTab === 'targets-for-life' && (
        <div className="tab-content">
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

          {/* Target Form Modal */}
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
                        onChange={(e) => setTargetForm({...targetForm, totalSavingsTarget: e.target.value})}
                        placeholder="Enter total amount"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Target Description</label>
                      <input
                        type="text"
                        value={targetForm.targetDescription}
                        onChange={(e) => setTargetForm({...targetForm, targetDescription: e.target.value})}
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
      )}

      {/* Cheque Register Tab */}
      {activeTab === 'cheque-register' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Cheque Register</h2>
            <button
              className="add-btn"
              onClick={() => {
                resetChequeForm();
                setShowChequeForm(true);
              }}
            >
              Add Cheque Record
            </button>
          </div>

          {/* Cheque Form Modal */}
          {showChequeForm && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>{editingCheque ? 'Edit' : 'Add'} Cheque Record</h3>
                  <button onClick={() => setShowChequeForm(false)} className="close-btn">×</button>
                </div>
                <div className="cheque-form-grid">
                  <div className="form-group">
                    <label>Received Date</label>
                    <input
                      type="date"
                      value={chequeForm.receivedDate}
                      onChange={(e) => setChequeForm({...chequeForm, receivedDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cheque Deposit Date</label>
                    <input
                      type="date"
                      value={chequeForm.chequeDepositDate}
                      onChange={(e) => setChequeForm({...chequeForm, chequeDepositDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Difference (Days)</label>
                    <input
                      type="number"
                      value={chequeForm.difference}
                      onChange={(e) => setChequeForm({...chequeForm, difference: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Reason for Delay</label>
                    <input
                      type="text"
                      value={chequeForm.reasonForDelay}
                      onChange={(e) => setChequeForm({...chequeForm, reasonForDelay: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cheque Party Details</label>
                    <input
                      type="text"
                      value={chequeForm.chequePartyDetails}
                      onChange={(e) => setChequeForm({...chequeForm, chequePartyDetails: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Head</label>
                    <input
                      type="text"
                      value={chequeForm.accountHead}
                      onChange={(e) => setChequeForm({...chequeForm, accountHead: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Deposit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={chequeForm.deposit}
                      onChange={(e) => setChequeForm({...chequeForm, deposit: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Withdrawal</label>
                    <input
                      type="number"
                      step="0.01"
                      value={chequeForm.withdrawal}
                      onChange={(e) => setChequeForm({...chequeForm, withdrawal: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={chequeForm.amount}
                      onChange={(e) => setChequeForm({...chequeForm, amount: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bank</label>
                    <input
                      type="text"
                      value={chequeForm.bank}
                      onChange={(e) => setChequeForm({...chequeForm, bank: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cheque Number</label>
                    <input
                      type="text"
                      value={chequeForm.chequeNumber}
                      onChange={(e) => setChequeForm({...chequeForm, chequeNumber: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cheque Deposited In Bank</label>
                    <input
                      type="text"
                      value={chequeForm.chequeDepositedInBank}
                      onChange={(e) => setChequeForm({...chequeForm, chequeDepositedInBank: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Received For</label>
                    <input
                      type="text"
                      value={chequeForm.receivedFor}
                      onChange={(e) => setChequeForm({...chequeForm, receivedFor: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Received By</label>
                    <input
                      type="text"
                      value={chequeForm.receivedBy}
                      onChange={(e) => setChequeForm({...chequeForm, receivedBy: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button onClick={handleChequeSave} className="save-btn">Save</button>
                  <button onClick={() => setShowChequeForm(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Cheque Records Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Received Date</th>
                  <th>Cheque Deposit Date</th>
                  <th>Difference</th>
                  <th>Reason for Delay</th>
                  <th>Cheque Party Details</th>
                  <th>Account Head</th>
                  <th>Deposit</th>
                  <th>Withdrawal</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Cheque Number</th>
                  <th>Cheque Deposited In Bank</th>
                  <th>Received For</th>
                  <th>Received By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chequeRecords.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="no-data">No cheque records found</td>
                  </tr>
                ) : (
                  chequeRecords.map((record) => (
                    <tr key={record._id}>
                      <td>{new Date(record.receivedDate).toLocaleDateString('en-IN')}</td>
                      <td>{record.chequeDepositDate ? new Date(record.chequeDepositDate).toLocaleDateString('en-IN') : '-'}</td>
                      <td>{record.difference || '-'}</td>
                      <td>{record.reasonForDelay || '-'}</td>
                      <td>{record.chequePartyDetails || '-'}</td>
                      <td>{record.accountHead || '-'}</td>
                      <td>{record.deposit ? `₹${Number(record.deposit).toLocaleString('en-IN')}` : '-'}</td>
                      <td>{record.withdrawal ? `₹${Number(record.withdrawal).toLocaleString('en-IN')}` : '-'}</td>
                      <td>{record.amount ? `₹${Number(record.amount).toLocaleString('en-IN')}` : '-'}</td>
                      <td>{record.bank || '-'}</td>
                      <td>{record.chequeNumber || '-'}</td>
                      <td>{record.chequeDepositedInBank || '-'}</td>
                      <td>{record.receivedFor || '-'}</td>
                      <td>{record.receivedBy || '-'}</td>
                      <td>
                        <button onClick={() => handleChequeEdit(record)} className="edit-btn">Edit</button>
                        <button onClick={() => handleChequeDelete(record._id)} className="delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Cash Register Tab */}
      {activeTab === 'daily-cash' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Daily Cash Register</h2>
            <button
              className="add-btn"
              onClick={() => {
                resetCashForm();
                setShowCashForm(true);
              }}
            >
              Add Cash Record
            </button>
          </div>

          {/* Cash Form Modal */}
          {showCashForm && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>{editingCash ? 'Edit' : 'Add'} Cash Record</h3>
                  <button onClick={() => setShowCashForm(false)} className="close-btn">×</button>
                </div>
                <div className="cash-form-grid">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={cashForm.date}
                      onChange={(e) => setCashForm({...cashForm, date: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={cashForm.description}
                      onChange={(e) => setCashForm({...cashForm, description: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Credit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashForm.credit}
                      onChange={(e) => setCashForm({...cashForm, credit: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Debit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashForm.debit}
                      onChange={(e) => setCashForm({...cashForm, debit: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Balance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashForm.balance}
                      onChange={(e) => setCashForm({...cashForm, balance: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={cashForm.category}
                      onChange={(e) => setCashForm({...cashForm, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      <option value="transfer">Transfer</option>
                      <option value="investment">Investment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Affected Account</label>
                    <input
                      type="text"
                      value={cashForm.affectedAccount}
                      onChange={(e) => setCashForm({...cashForm, affectedAccount: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Additional Details</label>
                    <textarea
                      value={cashForm.additionalDetails}
                      onChange={(e) => setCashForm({...cashForm, additionalDetails: e.target.value})}
                      rows="3"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button onClick={handleCashSave} className="save-btn">Save</button>
                  <button onClick={() => setShowCashForm(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Cash Records Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Credit</th>
                  <th>Debit</th>
                  <th>Balance</th>
                  <th>Category</th>
                  <th>Affected Account</th>
                  <th>Additional Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cashRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">No cash records found</td>
                  </tr>
                ) : (
                  cashRecords.map((record) => (
                    <tr key={record._id}>
                      <td>{new Date(record.date).toLocaleDateString('en-IN')}</td>
                      <td>{record.description || '-'}</td>
                      <td>{record.credit ? `₹${Number(record.credit).toLocaleString('en-IN')}` : '-'}</td>
                      <td>{record.debit ? `₹${Number(record.debit).toLocaleString('en-IN')}` : '-'}</td>
                      <td>{record.balance ? `₹${Number(record.balance).toLocaleString('en-IN')}` : '-'}</td>
                      <td>{record.category || '-'}</td>
                      <td>{record.affectedAccount || '-'}</td>
                      <td>{record.additionalDetails || '-'}</td>
                      <td>
                        <button onClick={() => handleCashEdit(record)} className="edit-btn">Edit</button>
                        <button onClick={() => handleCashDelete(record._id)} className="delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Milestone & Task Timeline Tab */}
      {activeTab === 'milestones' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Milestone & Task Timeline</h2>
            <button
              className="add-btn"
              onClick={() => {
                resetMilestoneForm();
                setShowMilestoneForm(true);
              }}
            >
              Add Milestone
            </button>
          </div>

          {/* Milestone Form Modal */}
          {showMilestoneForm && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>{editingMilestone ? 'Edit' : 'Add'} Milestone</h3>
                  <button onClick={() => setShowMilestoneForm(false)} className="close-btn">×</button>
                </div>
                <div className="milestone-form-grid">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={milestoneForm.title}
                      onChange={(e) => setMilestoneForm({...milestoneForm, title: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={milestoneForm.description}
                      onChange={(e) => setMilestoneForm({...milestoneForm, description: e.target.value})}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={milestoneForm.startDate}
                      onChange={(e) => setMilestoneForm({...milestoneForm, startDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={milestoneForm.endDate}
                      onChange={(e) => setMilestoneForm({...milestoneForm, endDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={milestoneForm.status}
                      onChange={(e) => setMilestoneForm({...milestoneForm, status: e.target.value})}
                    >
                      <option value="planning">Planning</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={milestoneForm.priority}
                      onChange={(e) => setMilestoneForm({...milestoneForm, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assigned To</label>
                    <input
                      type="text"
                      value={milestoneForm.assignedTo}
                      onChange={(e) => setMilestoneForm({...milestoneForm, assignedTo: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={milestoneForm.progress}
                      onChange={(e) => setMilestoneForm({...milestoneForm, progress: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button onClick={handleMilestoneSave} className="save-btn">Save</button>
                  <button onClick={() => setShowMilestoneForm(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Milestones Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {milestones.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">No milestones found</td>
                  </tr>
                ) : (
                  milestones.map((milestone) => (
                    <tr key={milestone._id}>
                      <td>{milestone.title}</td>
                      <td>{milestone.description || '-'}</td>
                      <td>{new Date(milestone.startDate).toLocaleDateString('en-IN')}</td>
                      <td>{milestone.endDate ? new Date(milestone.endDate).toLocaleDateString('en-IN') : '-'}</td>
                      <td>
                        <span className={`status-badge ${milestone.status}`}>
                          {milestone.status?.replace('-', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge ${milestone.priority}`}>
                          {milestone.priority}
                        </span>
                      </td>
                      <td>{milestone.assignedTo || '-'}</td>
                      <td>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${milestone.progress || 0}%` }}
                          ></div>
                          <span>{milestone.progress || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <button onClick={() => handleMilestoneEdit(milestone)} className="edit-btn">Edit</button>
                        <button onClick={() => handleMilestoneDelete(milestone._id)} className="delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      )}
            
      
      
    </div>
  );
};

export default Budget;