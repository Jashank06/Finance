import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './Budget.css';

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

  // Milestone State
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [chequeRes, cashRes, milestoneRes] = await Promise.all([
        api.get('/budget/cheque-register'),
        api.get('/budget/daily-cash'),
        api.get('/budget/milestones')
      ]);
      
      setChequeRecords(chequeRes.data || []);
      setCashRecords(cashRes.data || []);
      setMilestones(milestoneRes.data || []);
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
      </div>

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