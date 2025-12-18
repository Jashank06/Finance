import { useState, useEffect } from 'react';
import api from '../utils/api';
import './CashMemberManagement.css';
import { syncInventoryFromTransaction } from '../utils/inventorySyncUtil';
import { getBroaderCategories, getMainCategories, getSubCategories } from '../utils/categoryData';

const CashMemberManagement = ({ familyMembers = [] }) => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    relation: 'self',
    budget: '',
    initialBalance: '',
    currency: 'INR',
    notes: ''
  });

  const [transactionForm, setTransactionForm] = useState({
    memberId: '',
    type: 'expense',
    amount: '',
    category: 'other',
    broaderCategory: '',
    mainCategory: '',
    subCategory: '',
    customSubCategory: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    transactionType: '',
    expenseType: '',
    modeOfTransaction: 'cash',
    paymentMethod: 'cash',
    location: '',
    notes: '',
    narration: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchMemberTransactions(selectedMember._id);
    }
  }, [selectedMember]);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/cash-members');
      setMembers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members:', error);
      setLoading(false);
    }
  };

  const fetchMemberTransactions = async (memberId) => {
    try {
      const response = await api.get(`/cash-transactions/member/${memberId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchData = async () => {
    await fetchMembers();
    if (selectedMember) {
      await fetchMemberTransactions(selectedMember._id);
    }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await api.put(`/cash-members/${editingMember._id}`, memberForm);
      } else {
        await api.post('/cash-members', memberForm);
      }
      fetchMembers();
      resetMemberForm();
      setShowMemberForm(false);
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Error saving member');
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare transaction data for backend (remove frontend-only fields)
      const dataToSend = { ...transactionForm, memberId: selectedMember._id };

      // If inventory category exists, append it to description  
      if (dataToSend.inventoryCategory) {
        const categoryInfo = `[Inventory: ${dataToSend.inventoryCategory}]`;
        dataToSend.description = dataToSend.description
          ? `${categoryInfo} ${dataToSend.description}`
          : categoryInfo;
        delete dataToSend.inventoryCategory; // Remove field not in backend model
      }

      if (editingTransaction) {
        await api.put(`/cash-transactions/${editingTransaction._id}`, dataToSend);
      } else {
        await api.post('/cash-transactions', dataToSend);

        // Sync to Inventory if category is inventory-related
        await syncInventoryFromTransaction(transactionForm, 'cash');
      }

      setShowTransactionForm(false);
      setEditingTransaction(null);
      resetTransactionForm();
      fetchData();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving transaction');
    }
  };

  const handleMemberEdit = (member) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      relation: member.relation,
      budget: member.budget,
      initialBalance: member.initialBalance,
      currency: member.currency,
      notes: member.notes || ''
    });
    setShowMemberForm(true);
  };

  const handleMemberDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await api.delete(`/cash-members/${memberId}`);
        if (selectedMember && selectedMember._id === memberId) {
          setSelectedMember(null);
          setTransactions([]);
        }
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Error deleting member');
      }
    }
  };

  const handleTransactionEdit = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      memberId: transaction.memberId._id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split('T')[0],
      transactionType: transaction.transactionType || '',
      expenseType: transaction.expenseType || '',
      modeOfTransaction: transaction.modeOfTransaction || 'cash',
      paymentMethod: transaction.paymentMethod || 'cash',
      location: transaction.location || '',
      notes: transaction.notes || '',
      narration: transaction.narration || ''
    });
    setShowTransactionForm(true);
  };

  const handleTransactionDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/cash-transactions/${transactionId}`);
        fetchMemberTransactions(selectedMember._id);
        fetchMembers(); // Refresh to update balance
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction');
      }
    }
  };

  const resetMemberForm = () => {
    setMemberForm({
      name: '',
      relation: 'self',
      budget: '',
      initialBalance: '',
      currency: 'INR',
      notes: ''
    });
    setEditingMember(null);
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      memberId: '',
      type: 'expense',
      amount: '',
      category: 'other',
      broaderCategory: '',
      mainCategory: '',
      subCategory: '',
      customSubCategory: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      transactionType: '',
      expenseType: '',
      modeOfTransaction: 'cash',
      paymentMethod: 'cash',
      location: '',
      notes: '',
      narration: ''
    });
    setEditingTransaction(null);
  };

  const calculateSpent = (member) => {
    return member.initialBalance - member.currentBalance;
  };

  const calculatePercentage = (member) => {
    if (member.budget === 0) return 0;
    const spent = calculateSpent(member);
    return ((spent / member.budget) * 100).toFixed(1);
  };

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
    const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

    if (startDate && transactionDate < startDate) return false;
    if (endDate && transactionDate > endDate) return false;

    return true;
  });

  // Reset date filter
  const resetDateFilter = () => {
    setDateFilter({
      startDate: '',
      endDate: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="cash-member-management">
      {!selectedMember ? (
        // Members List View
        <div className="members-view">
          <div className="section-header">
            <h2>Family Cash Management</h2>
            <button
              className="add-btn"
              onClick={() => {
                resetMemberForm();
                setShowMemberForm(true);
              }}
            >
              Add Family Member
            </button>
          </div>

          <div className="members-table-container">
            {members.length === 0 ? (
              <div className="empty-state">
                <p>No family members added yet. Click "Add Family Member" to get started!</p>
              </div>
            ) : (
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Relation</th>
                    <th>Budget</th>
                    <th>Initial Balance</th>
                    <th>Current Balance</th>
                    <th>Spent</th>
                    <th>Budget Usage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => {
                    const spent = calculateSpent(member);
                    const percentage = calculatePercentage(member);
                    const isOverBudget = spent > member.budget;

                    return (
                      <tr key={member._id}>
                        <td>
                          <span
                            onClick={() => setSelectedMember(member)}
                            className="member-name-link"
                          >
                            {member.name}
                          </span>
                        </td>
                        <td>
                          <span className="relation-badge">{member.relation}</span>
                        </td>
                        <td className="amount-col">
                          {member.currency} {member.budget.toLocaleString('en-IN')}
                        </td>
                        <td className="amount-col">
                          {member.currency} {member.initialBalance.toLocaleString('en-IN')}
                        </td>
                        <td className={`amount-col ${member.currentBalance < 0 ? 'negative' : ''}`}>
                          {member.currency} {member.currentBalance.toLocaleString('en-IN')}
                        </td>
                        <td className={`amount-col ${isOverBudget ? 'over-budget' : ''}`}>
                          {member.currency} {spent.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <div className="budget-progress">
                            <div className="budget-bar-inline">
                              <div
                                className={`budget-fill-inline ${isOverBudget ? 'over' : ''}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`percentage-text ${isOverBudget ? 'over-budget' : ''}`}>
                              {percentage}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button onClick={() => handleMemberEdit(member)} className="edit-btn">Edit</button>
                            <button onClick={() => handleMemberDelete(member._id)} className="delete-btn">Delete</button>
                            <button
                              onClick={() => setSelectedMember(member)}
                              className="view-btn"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Member Form Modal */}
          {showMemberForm && (
            <div className="modal-overlay" onClick={() => setShowMemberForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{editingMember ? 'Edit' : 'Add'} Family Member</h3>
                <form onSubmit={handleMemberSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Name *</label>
                      <select
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        required
                      >
                        <option value="">Select family member...</option>
                        {familyMembers.map((member, index) => (
                          <option key={index} value={member.name}>{member.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Relation *</label>
                      <select
                        value={memberForm.relation}
                        onChange={(e) => setMemberForm({ ...memberForm, relation: e.target.value })}
                        required
                      >
                        <option value="self">Self</option>
                        <option value="spouse">Spouse</option>
                        <option value="son">Son</option>
                        <option value="daughter">Daughter</option>
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="brother">Brother</option>
                        <option value="sister">Sister</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Budget *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={memberForm.budget}
                        onChange={(e) => setMemberForm({ ...memberForm, budget: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Initial Balance *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={memberForm.initialBalance}
                        onChange={(e) => setMemberForm({ ...memberForm, initialBalance: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        value={memberForm.currency}
                        onChange={(e) => setMemberForm({ ...memberForm, currency: e.target.value })}
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label>Notes</label>
                      <textarea
                        value={memberForm.notes}
                        onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => {
                      setShowMemberForm(false);
                      resetMemberForm();
                    }}>
                      Cancel
                    </button>
                    <button type="submit">
                      {editingMember ? 'Update' : 'Add'} Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Transactions View
        <div className="transactions-view">
          <button
            className="back-btn"
            onClick={() => setSelectedMember(null)}
          >
            ← Back to Members
          </button>

          <div className="member-detail-header">
            <div>
              <h2>{selectedMember.name}'s Transactions</h2>
              <p className="member-info">
                Budget: {selectedMember.currency} {selectedMember.budget.toLocaleString('en-IN')} |
                Current Balance: {selectedMember.currency} {selectedMember.currentBalance.toLocaleString('en-IN')} |
                Spent: {selectedMember.currency} {calculateSpent(selectedMember).toLocaleString('en-IN')}
              </p>
            </div>
            <button
              className="add-btn"
              onClick={() => {
                resetTransactionForm();
                setShowTransactionForm(true);
              }}
            >
              Add Transaction
            </button>
          </div>

          {/* Date Filter Section */}
          <div className="date-filter-section" style={{
            margin: '20px 0',
            padding: '15px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Filter by Date Range</h4>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontWeight: '500', minWidth: '80px' }}>Start Date:</label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontWeight: '500', minWidth: '70px' }}>End Date:</label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <button
                onClick={resetDateFilter}
                style={{
                  padding: '6px 15px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Clear Filter
              </button>
              <span style={{ color: '#666', fontSize: '14px' }}>
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </span>
            </div>
          </div>

          <div className="transactions-table">
            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <p>No transactions yet. Click "Add Transaction" to record an expense or income.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Date</th>
                    <th>Mode of Transaction</th>
                    <th>Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Balance</th>
                    <th>Type of Transaction</th>
                    <th>Broader Category</th>
                    <th>Main Category</th>
                    <th>Sub Category</th>
                    <th>Relevance/Expense Type</th>
                    <th>Details (Narration)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let runningBalance = selectedMember.initialBalance;
                    return filteredTransactions.map((transaction, index) => {
                      // Calculate debit/credit
                      const isDebit = transaction.type === 'expense';
                      const debit = isDebit ? transaction.amount : 0;
                      const credit = !isDebit ? transaction.amount : 0;

                      // Update running balance
                      if (isDebit) {
                        runningBalance -= transaction.amount;
                      } else {
                        runningBalance += transaction.amount;
                      }

                      return (
                        <tr key={transaction._id}>
                          <td>{index + 1}</td>
                          <td>{new Date(transaction.date).toLocaleDateString('en-IN')}</td>
                          <td>
                            <span className="mode-badge">
                              {transaction.modeOfTransaction ? transaction.modeOfTransaction.toUpperCase().replace('-', ' ') : 'CASH'}
                            </span>
                          </td>
                          <td>{transaction.description}</td>
                          <td className="debit-amount">
                            {debit > 0 ? `${selectedMember.currency} ${debit.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="credit-amount">
                            {credit > 0 ? `${selectedMember.currency} ${credit.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className={`balance-amount ${runningBalance < 0 ? 'negative' : ''}`}>
                            {selectedMember.currency} {runningBalance.toLocaleString('en-IN')}
                          </td>
                          <td>
                            {transaction.transactionType ? transaction.transactionType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                          </td>
                          <td>
                            {transaction.broaderCategory || '-'}
                          </td>
                          <td>
                            {transaction.mainCategory || '-'}
                          </td>
                          <td>
                            {transaction.subCategory === 'Other' && transaction.customSubCategory
                              ? transaction.customSubCategory
                              : (transaction.subCategory || '-')}
                          </td>
                          <td>
                            {transaction.expenseType ? transaction.expenseType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                          </td>
                          <td>{transaction.narration || transaction.notes || '-'}</td>
                          <td>
                            <div className="table-actions">
                              <button onClick={() => handleTransactionEdit(transaction)} className="edit-btn">Edit</button>
                              <button onClick={() => handleTransactionDelete(transaction._id)} className="delete-btn">Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            )}
          </div>

          {/* Transaction Form Modal */}
          {showTransactionForm && (
            <div className="modal-overlay" onClick={() => setShowTransactionForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{editingTransaction ? 'Edit' : 'Add'} Transaction</h3>
                <form onSubmit={handleTransactionSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Type *</label>
                      <select
                        value={transactionForm.type}
                        onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                        required
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                        <option value="transfer">Transfer</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Broader Category:</label>
                      <select
                        value={transactionForm.broaderCategory}
                        onChange={(e) => {
                          const broader = e.target.value;
                          setTransactionForm({
                            ...transactionForm,
                            broaderCategory: broader,
                            mainCategory: '',
                            subCategory: '',
                            customSubCategory: ''
                          });
                        }}
                        required
                      >
                        <option value="">Select broader category...</option>
                        {getBroaderCategories().map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Main Category - shown only when Broader Category is selected */}
                    {transactionForm.broaderCategory && (
                      <div className="form-group">
                        <label>Main Category:</label>
                        <select
                          value={transactionForm.mainCategory}
                          onChange={(e) => {
                            const main = e.target.value;
                            setTransactionForm({
                              ...transactionForm,
                              mainCategory: main,
                              subCategory: '',
                              customSubCategory: ''
                            });
                          }}
                          required
                        >
                          <option value="">Select main category...</option>
                          {getMainCategories(transactionForm.broaderCategory).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Sub Category - shown only when Main Category is selected */}
                    {transactionForm.mainCategory && (
                      <div className="form-group">
                        <label>Sub Category:</label>
                        <select
                          value={transactionForm.subCategory}
                          onChange={(e) => {
                            const sub = e.target.value;
                            setTransactionForm({
                              ...transactionForm,
                              subCategory: sub,
                              customSubCategory: sub === 'Other' ? '' : transactionForm.customSubCategory
                            });
                          }}
                          required
                        >
                          <option value="">Select sub category...</option>
                          {getSubCategories(transactionForm.broaderCategory, transactionForm.mainCategory).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Custom Sub Category - shown only when "Other" is selected */}
                    {transactionForm.subCategory === 'Other' && (
                      <div className="form-group">
                        <label>Custom Sub Category:</label>
                        <input
                          type="text"
                          value={transactionForm.customSubCategory}
                          onChange={(e) => setTransactionForm({ ...transactionForm, customSubCategory: e.target.value })}
                          placeholder="Enter custom sub category..."
                          required
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Date *</label>
                      <input
                        type="date"
                        value={transactionForm.date}
                        onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Mode of Transaction *</label>
                      <select
                        value={transactionForm.modeOfTransaction}
                        onChange={(e) => setTransactionForm({ ...transactionForm, modeOfTransaction: e.target.value })}
                        required
                      >
                        <option value="cash">Cash</option>
                        <option value="credit-card">Credit Card</option>
                        <option value="debit-card">Debit Card</option>
                        <option value="upi">UPI</option>
                        <option value="neft">NEFT</option>
                        <option value="rtgs">RTGS</option>
                        <option value="imps">IMPS</option>
                        <option value="cheque">Cheque</option>
                        <option value="dd">DD (Demand Draft)</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Transaction Type</label>
                      <select
                        value={transactionForm.transactionType}
                        onChange={(e) => setTransactionForm({ ...transactionForm, transactionType: e.target.value })}
                      >
                        <option value="">Select type...</option>
                        <option value="expense">Expense</option>
                        <option value="transfer">Transfer</option>
                        <option value="loan-give">Loan Give</option>
                        <option value="loan-take">Loan Take</option>
                        <option value="udhar-give">Udhar Give</option>
                        <option value="udhar-receive">Udhar Receive</option>
                        <option value="on-behalf-in">On-behalf - Amount In</option>
                        <option value="on-behalf-out">On-behalf - Amount Out</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Expense Type</label>
                      <select
                        value={transactionForm.expenseType}
                        onChange={(e) => setTransactionForm({ ...transactionForm, expenseType: e.target.value })}
                      >
                        <option value="">Select type...</option>
                        <option value="important-necessary">Important & Necessary</option>
                        <option value="less-important">Less Important</option>
                        <option value="avoidable-loss">Avoidable & Loss</option>
                        <option value="unnecessary">Un-necessary</option>
                        <option value="basic-necessity">Basic Necessity</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label>Description *</label>
                      <textarea
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                        rows="2"
                        required
                        placeholder="Brief description of transaction"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Details of Transaction (Narration)</label>
                      <textarea
                        value={transactionForm.narration}
                        onChange={(e) => setTransactionForm({ ...transactionForm, narration: e.target.value })}
                        rows="2"
                        placeholder="Detailed narration or notes about this transaction"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => {
                      setShowTransactionForm(false);
                      resetTransactionForm();
                    }}>
                      Cancel
                    </button>
                    <button type="submit">
                      {editingTransaction ? 'Update' : 'Add'} Transaction
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CashMemberManagement;
