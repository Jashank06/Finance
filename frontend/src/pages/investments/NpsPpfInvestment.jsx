import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { investmentAPI } from '../../utils/investmentAPI';
import { staticAPI } from '../../utils/staticAPI';
import { fetchNPSNav, fetchPPFRate, fetchPostOfficeRates } from '../../utils/livePricesAPI';
import './Investment.css';
import { syncBillScheduleFromForm } from '../../utils/billScheduleSyncUtil';
import { syncInvestmentProfileFromForm } from '../../utils/syncInvestmentProfileUtil';

import { trackFeatureUsage, trackAction } from '../../utils/featureTracking';

const NpsPpfInvestment = () => {
  const [investments, setInvestments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const formRef = useRef(null);
  const [liveRates, setLiveRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState(null);
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

  /* Professional, vibrant palette for chart distinction */
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  // Fetch live rates
  const fetchRates = async () => {
    setRatesLoading(true);
    try {
      const [npsNav, ppfRate, postOfficeRates] = await Promise.all([
        fetchNPSNav(),
        fetchPPFRate(),
        fetchPostOfficeRates()
      ]);
      setLiveRates({ nps: npsNav, ppf: ppfRate, postOffice: postOfficeRates });
      setLastRateUpdate(new Date());
    } catch (error) {
      console.error('Error fetching live rates:', error);
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => {
    trackFeatureUsage('/family/investments/nps-ppf', 'view');
    fetchInvestments();
    fetchFamilyMembers();
    fetchRates();

    // Auto-refresh rates every 5 minutes
    const rateInterval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(rateInterval);
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
      await syncInvestmentProfileFromForm(formData, 'NpsPpfInvestment');

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

  const calculateInvestmentDetails = (amount, rate, startDate, frequency, maturityDate) => {
    if (!amount || !startDate) return { totalInvested: 0, currentValue: 0, count: 0 };

    const start = new Date(startDate);
    const now = new Date();
    const maturity = maturityDate ? new Date(maturityDate) : null;
    const calcEndDate = (maturity && maturity < now) ? maturity : now;

    if (isNaN(start.getTime())) return { totalInvested: 0, currentValue: 0, count: 0 };

    const principal = parseFloat(amount);
    const r_annual = (parseFloat(rate) || 0) / 100;

    let count = 0;
    let totalInvested = 0;
    let currentValue = 0;

    if (frequency === 'one-time') {
      count = 1;
      totalInvested = principal;
      const timeInYears = (calcEndDate - start) / (1000 * 60 * 60 * 24 * 365.25);
      currentValue = principal * Math.pow(1 + r_annual, timeInYears);
    } else {
      // Recurring Calculation
      let monthsDiff = (calcEndDate.getFullYear() - start.getFullYear()) * 12 + (calcEndDate.getMonth() - start.getMonth()) + 1;

      if (frequency === 'monthly') {
        count = monthsDiff;
        totalInvested = principal * count;
        if (r_annual > 0) {
          const r_monthly = r_annual / 12;
          currentValue = principal * ((Math.pow(1 + r_monthly, count) - 1) / r_monthly) * (1 + r_monthly);
        } else {
          currentValue = totalInvested;
        }
      } else if (frequency === 'quarterly') {
        count = Math.ceil(monthsDiff / 3);
        totalInvested = principal * count;
        if (r_annual > 0) {
          const r_q = r_annual / 4;
          currentValue = principal * ((Math.pow(1 + r_q, count) - 1) / r_q) * (1 + r_q);
        } else {
          currentValue = totalInvested;
        }
      } else if (frequency === 'yearly') {
        count = Math.ceil(monthsDiff / 12);
        totalInvested = principal * count;
        if (r_annual > 0) {
          currentValue = principal * ((Math.pow(1 + r_annual, count) - 1) / r_annual) * (1 + r_annual);
        } else {
          currentValue = totalInvested;
        }
      }
    }

    return {
      totalInvested: Math.round(totalInvested),
      currentValue: Math.round(currentValue),
      count
    };
  };

  // Auto-populate Interest Rate based on Type
  useEffect(() => {
    if (showForm && !editingId && liveRates) {
      let rate = '';
      if (formData.type === 'PPF') rate = liveRates.ppf?.currentRate;
      else if (formData.type === 'SSY') rate = liveRates.postOffice?.SSY?.rate;
      else if (formData.type === 'NSC') rate = liveRates.postOffice?.NSC?.rate;
      else if (formData.type === 'NPS') rate = liveRates.nps?.tier1?.avgReturn;

      if (rate && !formData.interestRate) {
        setFormData(prev => ({ ...prev, interestRate: rate.toString() }));
      }
    }
  }, [formData.type, showForm, editingId, liveRates]);

  // Proactive Auto-Calculate Effect for Form
  useEffect(() => {
    if (showForm && formData.amount && formData.interestRate && formData.startDate) {
      const { totalInvested, currentValue } = calculateInvestmentDetails(
        formData.amount,
        formData.interestRate,
        formData.startDate,
        formData.frequency,
        formData.maturityDate
      );

      const currentValNum = parseFloat(formData.currentValue) || 0;
      const shouldUpdate = !editingId ||
        currentValNum === 0 ||
        (formData.frequency !== 'one-time' && currentValNum < totalInvested);

      if (shouldUpdate && currentValue > 0) {
        setFormData(prev => ({ ...prev, currentValue: currentValue.toString() }));
      }
    }
  }, [formData.amount, formData.interestRate, formData.startDate, formData.maturityDate, formData.frequency, showForm, editingId]);

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
    const totals = investments.reduce((acc, inv) => {
      const { totalInvested, currentValue: calculatedCurrent } = calculateInvestmentDetails(
        inv.amount,
        inv.interestRate,
        inv.startDate,
        inv.frequency,
        inv.maturityDate
      );

      // Proactive Sync: Use calculated value if saved value is clearly wrong
      const current = (inv.frequency !== 'one-time' && (inv.currentValue || 0) < totalInvested)
        ? calculatedCurrent
        : (inv.currentValue || totalInvested || 0);

      acc.total += totalInvested;
      acc.currentTotal += current;
      return acc;
    }, { total: 0, currentTotal: 0 });

    const returns = totals.currentTotal - totals.total;
    const returnsPercent = totals.total > 0 ? ((returns / totals.total) * 100).toFixed(2) : 0;
    return {
      total: totals.total,
      currentTotal: totals.currentTotal,
      returns,
      returnsPercent
    };
  };

  const getChartData = () => {
    const typeData = investments.reduce((acc, inv) => {
      const { totalInvested, currentValue: calculatedCurrent } = calculateInvestmentDetails(
        inv.amount,
        inv.interestRate,
        inv.startDate,
        inv.frequency,
        inv.maturityDate
      );
      const current = (inv.frequency !== 'one-time' && (inv.currentValue || 0) < totalInvested)
        ? calculatedCurrent
        : (inv.currentValue || totalInvested || 0);

      const existing = acc.find(item => item.name === inv.type);
      if (existing) {
        existing.value += current;
      } else {
        acc.push({ name: inv.type, value: current });
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
        <button className="btn-add-investment" onClick={() => setShowForm(!showForm)}>
          <FiPlus /> {showForm ? 'Cancel' : 'Add Investment'}
        </button>
      </div>

      {/* Live Interest Rates */}
      <div className="live-rates-section">
        <div className="live-rates-header">
          <h3>
            <span className="live-indicator"></span>
            Current Interest Rates (Govt. Schemes)
          </h3>
          <button
            onClick={fetchRates}
            disabled={ratesLoading}
            className={`refresh-rates-btn ${ratesLoading ? 'loading' : ''}`}
          >
            <FiRefreshCw className={ratesLoading ? 'spin' : ''} />
            {ratesLoading ? 'Updating...' : 'Refresh'}
          </button>
        </div>

        <div className="live-rates-grid">
          <div className="live-rate-card ppf-card">
            <p className="rate-label">PPF Rate</p>
            <h4 className="rate-value">
              {liveRates?.ppf?.currentRate || '--'}%
            </h4>
            <small className="rate-subtext">p.a.</small>
          </div>

          <div className="live-rate-card nps-card">
            <p className="rate-label">NPS (Equity)</p>
            <h4 className="rate-value">
              {liveRates?.nps?.tier1?.avgReturn || '--'}%
            </h4>
            <small className="rate-subtext">avg. return</small>
          </div>

          <div className="live-rate-card ssy-card">
            <p className="rate-label">SSY Rate</p>
            <h4 className="rate-value">
              {liveRates?.postOffice?.SSY?.rate || '--'}%
            </h4>
            <small className="rate-subtext">p.a.</small>
          </div>

          <div className="live-rate-card nsc-card">
            <p className="rate-label">NSC Rate</p>
            <h4 className="rate-value">
              {liveRates?.postOffice?.NSC?.rate || '--'}%
            </h4>
            <small className="rate-subtext">5 years</small>
          </div>

          <div className="live-rate-card scss-card">
            <p className="rate-label">SCSS Rate</p>
            <h4 className="rate-value">
              {liveRates?.postOffice?.SCSS?.rate || '--'}%
            </h4>
            <small className="rate-subtext">Senior Citizen</small>
          </div>

          <div className="live-rate-card kvp-card">
            <p className="rate-label">KVP Rate</p>
            <h4 className="rate-value">
              {liveRates?.postOffice?.KVP?.rate || '--'}%
            </h4>
            <small className="rate-subtext">{liveRates?.postOffice?.KVP?.tenure || '115 months'}</small>
          </div>
        </div>

        {lastRateUpdate && (
          <p className="rates-update-info">
            Last updated: {lastRateUpdate.toLocaleTimeString('en-IN')} | Rates as per Govt. notification
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-black">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Invested</p>
            <h3 className="stat-value">₹{totals.total.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-dark-gray">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Current Value</p>
            <h3 className="stat-value">₹{totals.currentTotal.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-gray">
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
          <div className="stat-icon icon-green-gradient">
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
          <div className="chart-card premium">
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
                <div className="input-with-live-indicator">
                  <input
                    type="number"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    placeholder="Current market value"
                    step="0.01"
                  />
                  {(() => {
                    const { totalInvested, currentValue } = calculateInvestmentDetails(
                      formData.amount,
                      formData.interestRate,
                      formData.startDate,
                      formData.frequency,
                      formData.maturityDate
                    );
                    if (totalInvested > 0) {
                      return (
                        <span className="live-badge" onClick={() => setFormData({ ...formData, currentValue: currentValue.toString() })}>
                          Auto Val: ₹{currentValue.toLocaleString('en-IN')} (Invested: ₹{totalInvested.toLocaleString('en-IN')})
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
                <small style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Auto-calculated based on interest rate & time.
                </small>
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
                  const { totalInvested, currentValue: calculatedCurrent } = calculateInvestmentDetails(
                    investment.amount,
                    investment.interestRate,
                    investment.startDate,
                    investment.frequency,
                    investment.maturityDate
                  );

                  // Proactive Sync for Table
                  const currentAmount = (investment.frequency !== 'one-time' && (investment.currentValue || 0) < totalInvested)
                    ? calculatedCurrent
                    : (investment.currentValue || totalInvested || 0);

                  const returns = currentAmount - totalInvested;
                  const returnsPercent = totalInvested > 0 ? ((returns / totalInvested) * 100).toFixed(2) : 0;

                  return (
                    <tr key={investment._id}>
                      <td>
                        <span className="investment-type-badge">{investment.type}</span>
                      </td>
                      <td title={investment.name + (investment.notes ? ' - ' + investment.notes : '')}>
                        <strong>{investment.name}</strong>
                      </td>
                      <td title={investment.accountNumber}>{investment.accountNumber || '-'}</td>
                      <td>₹{totalInvested.toLocaleString('en-IN')} {investment.frequency !== 'one-time' && <small title="Estimated contributions">(Auto)</small>}</td>
                      <td>₹{currentAmount.toLocaleString('en-IN')}</td>
                      <td style={{ color: returns >= 0 ? '#10B981' : '#ff6b6b', fontWeight: 'bold' }}>
                        ₹{returns.toLocaleString('en-IN')} ({returnsPercent}%)
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
