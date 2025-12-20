import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { investmentAPI } from '../../utils/investmentAPI';
import { staticAPI } from '../../utils/staticAPI';
import './Investment.css';
import { syncBillScheduleFromForm } from '../../utils/billScheduleSyncUtil';

const NpsPpfInvestment = () => {
  const [investments, setInvestments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    category: 'nps-ppf',
    type: 'NPS',
    name: '',
    accountNumber: '',
    amount: '',
    startDate: '',
    maturityDate: '',
    interestRate: '',
    frequency: 'yearly',
    currentValue: '',
    nameOfInvestor: '',
    subBroker: '',
    notes: '',
  });

  const COLORS = ['#C084FC', '#9333EA', '#7C3AED', '#8B5CF6', '#6366F1'];

  useEffect(() => {
    fetchInvestments();
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const familyRes = await staticAPI.getFamilyProfile();
      if (familyRes.data && familyRes.data.length > 0) {
        setFamilyMembers(familyRes.data[0].members || []);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
    }
  };

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await investmentAPI.getAll('nps-ppf');
      setInvestments(response.data.investments);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate) || 0,
        currentValue: parseFloat(formData.currentValue) || parseFloat(formData.amount),
      };

      if (editingId) {
        await investmentAPI.update(editingId, dataToSend);
      } else {
        await investmentAPI.create(dataToSend);
      }

      // Sync bills to Bill Dates/Checklist
      await syncBillScheduleFromForm(formData, 'NpsPpfInvestment');

      resetForm();
      fetchInvestments();
    } catch (error) {
      console.error('Error saving investment:', error);
      alert(error.response?.data?.message || 'Error saving investment');
    }
  };

  const handleEdit = (investment) => {
    setFormData({
      category: investment.category,
      type: investment.type,
      name: investment.name,
      accountNumber: investment.accountNumber || '',
      amount: investment.amount,
      startDate: investment.startDate?.split('T')[0] || '',
      maturityDate: investment.maturityDate?.split('T')[0] || '',
      interestRate: investment.interestRate || '',
      frequency: investment.frequency || 'yearly',
      currentValue: investment.currentValue || investment.amount,
      notes: investment.notes || '',
    });
    setEditingId(investment._id);
    setShowForm(true);
    // Scroll will happen via useEffect
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await investmentAPI.delete(id);
        fetchInvestments();
      } catch (error) {
        console.error('Error deleting investment:', error);
        alert('Error deleting investment');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'nps-ppf',
      type: 'NPS',
      name: '',
      accountNumber: '',
      amount: '',
      startDate: '',
      maturityDate: '',
      interestRate: '',
      frequency: 'yearly',
      currentValue: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const calculateTotals = () => {
    const total = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const currentTotal = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
    const returns = currentTotal - total;
    const returnsPercent = total > 0 ? ((returns / total) * 100).toFixed(2) : 0;
    return { total, currentTotal, returns, returnsPercent };
  };

  const getChartData = () => {
    const typeData = investments.reduce((acc, inv) => {
      const existing = acc.find(item => item.name === inv.type);
      if (existing) {
        existing.value += inv.amount;
      } else {
        acc.push({ name: inv.type, value: inv.amount });
      }
      return acc;
    }, []);
    return typeData;
  };

  const totals = calculateTotals();
  const chartData = getChartData();

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>NPS / Post Office / PPF Investments</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <FiPlus /> {showForm ? 'Cancel' : 'Add Investment'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #C084FC 0%, #9333EA 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Invested</p>
            <h3 className="stat-value">₹{totals.total.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #F87171 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Current Value</p>
            <h3 className="stat-value">₹{totals.currentTotal.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Returns</p>
            <h3 className="stat-value" style={{ color: totals.returns >= 0 ? '#10B981' : '#ff6b6b' }}>
              ₹{totals.returns.toLocaleString('en-IN')} ({totals.returnsPercent}%)
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Investments</p>
            <h3 className="stat-value">{investments.length}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      {investments.length > 0 && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Investment Distribution by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>{editingId ? 'Edit Investment' : 'Add New Investment'}</h2>
          <form onSubmit={handleSubmit} className="investment-form">
            <div className="form-row">
              <div className="form-field">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="NPS">NPS (National Pension Scheme)</option>
                  <option value="PPF">PPF (Public Provident Fund)</option>
                  <option value="Post Office">Post Office Schemes</option>
                  <option value="SSY">Sukanya Samriddhi Yojana</option>
                  <option value="NSC">National Savings Certificate</option>
                </select>
              </div>

              <div className="form-field">
                <label>Name/Description *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My PPF Account"
                  required
                />
              </div>

              <div className="form-field">
                <label>Name of Investor</label>
                <select
                  value={formData.nameOfInvestor}
                  onChange={(e) => setFormData({ ...formData, nameOfInvestor: e.target.value })}
                >
                  <option value="">Select family member...</option>
                  {familyMembers.map((member, index) => (
                    <option key={index} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Sub Broker</label>
                <input
                  type="text"
                  value={formData.subBroker}
                  onChange={(e) => setFormData({ ...formData, subBroker: e.target.value })}
                  placeholder="Sub broker name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Account/Policy Number"
                />
              </div>

              <div className="form-field">
                <label>Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Investment Amount"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Maturity Date</label>
                <input
                  type="date"
                  value={formData.maturityDate}
                  onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Interest Rate (%)</label>
                <input
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  placeholder="e.g., 7.1"
                  step="0.01"
                />
              </div>

              <div className="form-field">
                <label>Contribution Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <option value="one-time">One Time</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Current Value</label>
                <input
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="Current market value"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-field">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Investment' : 'Add Investment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Investments List */}
      <div className="investments-list">
        <h2>Your Investments</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : investments.length === 0 ? (
          <div className="empty-state">
            <p>No investments found. Add your first investment to get started!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="investments-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Account</th>
                  <th>Invested</th>
                  <th>Current</th>
                  <th>Returns</th>
                  <th>Rate</th>
                  <th>Start</th>
                  <th>Maturity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment) => {
                  const returns = (investment.currentValue || investment.amount) - investment.amount;
                  const returnsPercent = investment.amount > 0 ? ((returns / investment.amount) * 100).toFixed(2) : 0;

                  return (
                    <tr key={investment._id}>
                      <td>
                        <span className="investment-type-badge">{investment.type}</span>
                      </td>
                      <td title={investment.name + (investment.notes ? ' - ' + investment.notes : '')}>
                        <strong>{investment.name}</strong>
                      </td>
                      <td title={investment.accountNumber}>{investment.accountNumber || '-'}</td>
                      <td>₹{(investment.amount / 1000).toFixed(0)}k</td>
                      <td>₹{((investment.currentValue || investment.amount) / 1000).toFixed(0)}k</td>
                      <td style={{ color: returns >= 0 ? '#10B981' : '#ff6b6b', fontWeight: 'bold' }}>
                        ₹{(returns / 1000).toFixed(0)}k ({returnsPercent}%)
                      </td>
                      <td>{investment.interestRate ? `${investment.interestRate}%` : '-'}</td>
                      <td>{new Date(investment.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })}</td>
                      <td>{investment.maturityDate ? new Date(investment.maturityDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'}</td>
                      <td>
                        <div className="investment-actions">
                          <button onClick={() => handleEdit(investment)} className="btn-icon" title="Edit">
                            <FiEdit2 />
                          </button>
                          <button onClick={() => handleDelete(investment._id)} className="btn-icon btn-danger" title="Delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NpsPpfInvestment;
