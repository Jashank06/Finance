import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiDollarSign, FiActivity, FiBarChart2, FiCreditCard, FiRefreshCw } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { investmentAPI } from '../../utils/investmentAPI';
import { staticAPI } from '../../utils/staticAPI';
import { fetchBankRates } from '../../utils/livePricesAPI';
import './Investment.css';

import { trackFeatureUsage, trackAction } from '../../utils/featureTracking';

const BankSchemesInvestment = () => {
  const [investments, setInvestments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const formRef = useRef(null);
  const [bankRates, setBankRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState(null);
  const [formData, setFormData] = useState({
    category: 'bank-schemes',
    type: 'Fixed Deposit',
    name: '',
    bankName: '',
    accountNumber: '',
    amount: '',
    interestRate: '',
    startDate: '',
    maturityDate: '',
    frequency: 'yearly',
    currentValue: '',
    nameOfInvestor: '',
    subBroker: '',
    notes: '',
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Fetch live bank FD/RD rates
  const fetchRates = async () => {
    setRatesLoading(true);
    try {
      const rates = await fetchBankRates();
      setBankRates(rates);
      setLastRateUpdate(new Date());
    } catch (error) {
      console.error('Error fetching bank rates:', error);
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => {
    trackFeatureUsage('/family/investments/bank-schemes', 'view');
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
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await investmentAPI.getAll('bank-schemes');
      setInvestments(response.data.investments || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setInvestments([
        {
          _id: 'demo-1',
          category: 'bank-schemes',
          type: 'Fixed Deposit',
          name: 'HDFC FD Nov-2024',
          provider: 'HDFC Bank',
          accountNumber: 'XXXX1234',
          amount: 200000,
          currentValue: 212000,
          interestRate: 7.25,
          frequency: 'one-time',
          startDate: '2024-11-10',
          maturityDate: '2025-11-10',
          notes: '1 year FD'
        },
        {
          _id: 'demo-2',
          category: 'bank-schemes',
          type: 'Recurring Deposit',
          name: 'SBI RD 2024',
          provider: 'SBI',
          accountNumber: 'XXXX5678',
          amount: 50000,
          currentValue: 52000,
          interestRate: 6.5,
          frequency: 'monthly',
          startDate: '2024-01-01',
          maturityDate: '2025-01-01',
          notes: 'Monthly 4,000 deposit'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        category: 'bank-schemes',
        type: formData.type,
        name: formData.name,
        provider: formData.bankName,
        accountNumber: formData.accountNumber,
        amount: parseFloat(formData.amount) || 0,
        currentValue: parseFloat(formData.currentValue) || parseFloat(formData.amount) || 0,
        interestRate: parseFloat(formData.interestRate) || 0,
        startDate: formData.startDate,
        maturityDate: formData.maturityDate || undefined,
        frequency: formData.frequency,
        notes: formData.notes || '',
      };

      if (editingId) {
        await investmentAPI.update(editingId, dataToSend);
      } else {
        await investmentAPI.create(dataToSend);
      }

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
      name: investment.name || '',
      bankName: investment.provider || '',
      accountNumber: investment.accountNumber || '',
      amount: investment.amount || '',
      interestRate: investment.interestRate || '',
      startDate: investment.startDate?.split('T')[0] || '',
      maturityDate: investment.maturityDate?.split('T')[0] || '',
      frequency: investment.frequency || 'one-time',
      currentValue: investment.currentValue || investment.amount || '',
      notes: investment.notes || '',
    });
    setEditingId(investment._id);
    setShowForm(true);
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
      category: 'bank-schemes',
      type: 'Fixed Deposit',
      name: '',
      bankName: '',
      accountNumber: '',
      amount: '',
      interestRate: '',
      startDate: '',
      maturityDate: '',
      frequency: 'yearly',
      currentValue: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Helper to get live rate for a bank
  const getLiveRateForBank = (bankName) => {
    if (!bankRates || !bankName) return null;

    // Normalize bank name for matching
    const normalizedInput = bankName.toLowerCase();

    // Find matching bank key
    const bankKey = Object.keys(bankRates).find(key =>
      normalizedInput.includes(key.toLowerCase()) ||
      (key.toLowerCase().includes(normalizedInput) && normalizedInput.length > 3)
    );

    if (bankKey && bankRates[bankKey]) {
      return bankRates[bankKey].fd1Year; // Default to 1 Year FD rate
    }
    return null;
  };

  // Auto-populate Interest Rate based on Bank Name
  useEffect(() => {
    if (showForm && !editingId && formData.bankName && bankRates) {
      const liveRate = getLiveRateForBank(formData.bankName);
      if (liveRate && !formData.interestRate) {
        setFormData(prev => ({ ...prev, interestRate: liveRate }));
      }
    }
  }, [formData.bankName, showForm, editingId, bankRates]);

  // Unified Calculation Helper
  const calculateInvestmentDetails = (amount, rate, startDate, frequency, maturityDate) => {
    if (!amount || !startDate) return { totalInvested: 0, currentValue: 0, months: 0 };

    const start = new Date(startDate);
    const now = new Date();
    // For calculation, treat maturity date as the boundary if it's in the past
    const maturity = maturityDate ? new Date(maturityDate) : null;
    const calcEndDate = (maturity && maturity < now) ? maturity : now;

    if (isNaN(start.getTime())) return { totalInvested: 0, currentValue: 0, months: 0 };

    const principal = parseFloat(amount) || 0;
    const r_annual = (parseFloat(rate) || 0) / 100;

    if (frequency === 'monthly') {
      // Calculate months elapsed (including current month)
      const months = (calcEndDate.getFullYear() - start.getFullYear()) * 12 + (calcEndDate.getMonth() - start.getMonth()) + 1;
      const totalInvested = principal * months;

      // RD Formula: A = P * [(1 + r)^n - 1] / (1 - (1 + r)^-1/3) -- simplified or standard approx
      // Standard RD formula: A = P * ((1+r)^n - 1) / (1 - (1+r)^-1/3) is complex for different compounding.
      // Simple Monthly Compounding: A = P * ((1 + r/12)^n - 1) / (r/12) * (1 + r/12)
      if (r_annual > 0) {
        const r_monthly = r_annual / 12;
        const currentValue = principal * ((Math.pow(1 + r_monthly, months) - 1) / r_monthly) * (1 + r_monthly);
        return { totalInvested, currentValue: Math.round(currentValue), months };
      }
      return { totalInvested, currentValue: totalInvested, months };
    } else {
      // FD / One-time
      const timeInYears = (calcEndDate - start) / (1000 * 60 * 60 * 24 * 365.25);
      // Standard Compound Interest: A = P * (1 + r)^t
      const currentValue = principal * Math.pow((1 + r_annual), timeInYears);
      return { totalInvested: principal, currentValue: Math.round(currentValue), months: 0 };
    }
  };

  // Refined Auto-Calculate Effect
  useEffect(() => {
    if (showForm && formData.amount && formData.interestRate && formData.startDate) {
      const { totalInvested, currentValue } = calculateInvestmentDetails(
        formData.amount,
        formData.interestRate,
        formData.startDate,
        formData.frequency,
        formData.maturityDate
      );

      // Auto-update Current Value if:
      // 1. It's a new investment
      // 2. It's an RD and current value is less than total invested (mathematically incorrect)
      // 3. Current value is empty or 0
      const currentValNum = parseFloat(formData.currentValue) || 0;
      const shouldUpdate = !editingId ||
        currentValNum === 0 ||
        (formData.frequency === 'monthly' && currentValNum < totalInvested);

      if (shouldUpdate && currentValue > 0) {
        setFormData(prev => ({ ...prev, currentValue: currentValue.toString() }));
      }
    }
  }, [formData.amount, formData.interestRate, formData.startDate, formData.maturityDate, formData.frequency, showForm, editingId]);



  const calculateTotals = () => {
    const totals = investments.reduce((acc, inv) => {
      const { totalInvested, currentValue: calculatedCurrent } = calculateInvestmentDetails(
        inv.amount,
        inv.interestRate,
        inv.startDate,
        inv.frequency,
        inv.maturityDate
      );

      // Use calculated value for totals if saved value is suspicious for an RD
      const current = (inv.frequency === 'monthly' && (inv.currentValue || 0) < totalInvested)
        ? calculatedCurrent
        : (inv.currentValue || totalInvested || 0);

      acc.totalInvested += totalInvested;
      acc.totalCurrent += current;
      acc.totalRateSum += (inv.interestRate || 0);
      return acc;
    }, { totalInvested: 0, totalCurrent: 0, totalRateSum: 0 });

    const totalReturns = totals.totalCurrent - totals.totalInvested;
    const returnsPercent = totals.totalInvested > 0 ? ((totalReturns / totals.totalInvested) * 100).toFixed(2) : 0;
    const averageRate = investments.length > 0 ? (totals.totalRateSum / investments.length).toFixed(2) : 0;

    return {
      totalInvested: totals.totalInvested,
      totalCurrent: totals.totalCurrent,
      totalReturns,
      returnsPercent,
      averageRate
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
      const current = (inv.frequency === 'monthly' && (inv.currentValue || 0) < totalInvested)
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

  const getBankData = () => {
    const bankData = investments.reduce((acc, inv) => {
      const { totalInvested, currentValue: calculatedCurrent } = calculateInvestmentDetails(
        inv.amount,
        inv.interestRate,
        inv.startDate,
        inv.frequency,
        inv.maturityDate
      );
      const current = (inv.frequency === 'monthly' && (inv.currentValue || 0) < totalInvested)
        ? calculatedCurrent
        : (inv.currentValue || totalInvested || 0);

      const existing = acc.find(item => item.name === (inv.provider || inv.bankName));
      if (existing) {
        existing.value += current;
      } else {
        acc.push({ name: inv.provider || inv.bankName, value: current });
      }
      return acc;
    }, []);
    return bankData;
  };

  const getPerformanceData = () => {
    return investments.map(inv => {
      const { totalInvested } = calculateInvestmentDetails(
        inv.amount,
        inv.interestRate,
        inv.startDate,
        inv.frequency,
        inv.maturityDate
      );
      const current = inv.currentValue || totalInvested || 0;
      const returns = current - totalInvested;
      const returnsPercent = totalInvested > 0 ? ((returns / totalInvested) * 100).toFixed(2) : 0;

      return {
        name: (inv.name || `${inv.provider} ${inv.type}` || 'Deposit'),
        invested: totalInvested,
        current: current,
        returns: returns,
        returnsPercent: returnsPercent,
      };
    });
  };

  const totals = calculateTotals();
  const chartData = getChartData();
  const bankData = getBankData();
  const performanceData = getPerformanceData();

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Bank Schemes - RD, FD & Other Deposits</h1>
        <button className="btn-add-investment" onClick={() => setShowForm(!showForm)}>
          <FiPlus /> {showForm ? 'Cancel' : 'Add Investment'}
        </button>
      </div>

      {/* Live Bank FD/RD Rates */}
      {/* Live Bank FD/RD Rates */}
      <div className="live-rates-section">
        <div className="live-rates-header">
          <h3>
            <span className="live-indicator"></span>
            Bank FD Rates (1 Year)
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
            <p className="rate-label">SBI</p>
            <h4 className="rate-value">6.8%</h4>
            <small className="rate-subtext">FD 1Y</small>
          </div>

          <div className="live-rate-card nps-card">
            <p className="rate-label">HDFC</p>
            <h4 className="rate-value">7%</h4>
            <small className="rate-subtext">FD 1Y</small>
          </div>

          <div className="live-rate-card nsc-card">
            <p className="rate-label">ICICI</p>
            <h4 className="rate-value">6.9%</h4>
            <small className="rate-subtext">FD 1Y</small>
          </div>

          <div className="live-rate-card scss-card">
            <p className="rate-label">Axis</p>
            <h4 className="rate-value">7%</h4>
            <small className="rate-subtext">FD 1Y</small>
          </div>

          <div className="live-rate-card ssy-card">
            <p className="rate-label">Kotak</p>
            <h4 className="rate-value">7.2%</h4>
            <small className="rate-subtext">FD 1Y</small>
          </div>

          <div className="live-rate-card kvp-card">
            <p className="rate-label">PNB</p>
            <h4 className="rate-value">6.8%</h4>
            <small className="rate-subtext">FD 1Y</small>
          </div>

          <div className="live-rate-card ppf-card">
            <p className="rate-label">BOB</p>
            <h4 className="rate-value">6.85%</h4>
            <small className="rate-subtext">FD 1Y</small>
          </div>
        </div>

        {lastRateUpdate && (
          <p className="rates-update-info">
            Last updated: {lastRateUpdate.toLocaleTimeString('en-IN')} | Auto-refresh every 5 min
          </p>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-black">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Invested</p>
            <h3 className="stat-value">₹{totals.totalInvested.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-dark-gray">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Current Value</p>
            <h3 className="stat-value">₹{totals.totalCurrent.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-green-gradient">
            <FiActivity />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Returns</p>
            <h3 className="stat-value" style={{ color: totals.totalReturns >= 0 ? '#10B981' : '#EF4444' }}>
              ₹{totals.totalReturns.toLocaleString('en-IN')} ({totals.returnsPercent}%)
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-gray">
            <FiCreditCard />
          </div>
          <div className="stat-content">
            <p className="stat-label">Avg Interest Rate</p>
            <h3 className="stat-value">{totals.averageRate}%</h3>
          </div>
        </div>
      </div>

      {investments.length > 0 && (
        <div className="charts-section">
          <div className="charts-header">
            <h2>Portfolio Analytics</h2>
            <p>RD/FD allocation, bank-wise distribution and performance</p>
          </div>

          <div className="charts-grid">
            <div className="chart-card premium">
              <div className="chart-header">
                <div className="chart-title">
                  <FiTrendingUp className="chart-icon" />
                  <h3>Investment Distribution</h3>
                </div>
                <div className="chart-subtitle">By deposit type</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Value']} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card premium">
              <div className="chart-header">
                <div className="chart-title">
                  <FiBarChart2 className="chart-icon" />
                  <h3>Performance Analysis</h3>
                </div>
                <div className="chart-subtitle">Invested vs Current Value</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']} />
                    <Legend />
                    <Bar dataKey="invested" fill="#3B82F6" name="Invested" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="current" fill="#10B981" name="Current" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card premium full-width">
              <div className="chart-header">
                <div className="chart-title">
                  <FiActivity className="chart-icon" />
                  <h3>Bank-wise Allocation</h3>
                </div>
                <div className="chart-subtitle">Investment by bank</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={bankData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6D28D9" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Portfolio Value']} />
                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fill="url(#areaGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {investments.length > 0 && (
        <div className="table-container">
          <h2>Investment Details</h2>
          <table className="investments-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Bank</th>
                <th>Account</th>
                <th>Invested</th>
                <th>Current</th>
                <th>Returns</th>
                <th>Rate</th>
                <th>Frequency</th>
                <th>Start</th>
                <th>Maturity</th>
                <th className="sticky-actions">Actions</th>
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

                // Prioritize calculated value if saved value is clearly wrong for RD
                const currentAmount = (investment.frequency === 'monthly' && (investment.currentValue || 0) < totalInvested)
                  ? calculatedCurrent
                  : (investment.currentValue || totalInvested || 0);

                const returns = currentAmount - totalInvested;
                const returnsPercent = totalInvested > 0 ? ((returns / totalInvested) * 100).toFixed(2) : 0;

                return (
                  <tr key={investment._id}>
                    <td>
                      <span className="investment-type-badge" style={{
                        background: investment.type.includes('Fixed') ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' :
                          'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      }}>
                        {investment.type}
                      </span>
                    </td>
                    <td>{investment.name}</td>
                    <td>{investment.provider || investment.bankName}</td>
                    <td>{investment.accountNumber || 'N/A'}</td>
                    <td>₹{totalInvested.toLocaleString('en-IN')} {investment.frequency === 'monthly' && <small title="Estimated installments">(Auto)</small>}</td>
                    <td>₹{currentAmount.toLocaleString('en-IN')}</td>
                    <td style={{ color: returns >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                      ₹{returns.toLocaleString('en-IN')} ({returnsPercent}%)
                    </td>
                    <td>{investment.interestRate ? `${investment.interestRate}%` : 'N/A'}</td>
                    <td>{investment.frequency || 'one-time'}</td>
                    <td>{new Date(investment.startDate).toLocaleDateString('en-IN')}</td>
                    <td>{investment.maturityDate ? new Date(investment.maturityDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td className="sticky-actions">
                      <div className="investment-actions">
                        <button onClick={() => handleEdit(investment)} className="btn-icon">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(investment._id)} className="btn-icon btn-danger">
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

      {investments.length === 0 && !loading && (
        <div className="empty-state">
          <p>No deposits found. Add a new RD/FD to get started!</p>
        </div>
      )}

      {showForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>{editingId ? 'Edit Investment' : 'Add New Investment'}</h2>
          <form onSubmit={handleSubmit} className="investment-form">
            <div className="form-row">
              <div className="form-field">
                <label>Investment Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="Fixed Deposit">Fixed Deposit (FD)</option>
                  <option value="Recurring Deposit">Recurring Deposit (RD)</option>
                  <option value="Savings Deposit">Savings Deposit</option>
                </select>
              </div>

              <div className="form-field">
                <label>Deposit Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., HDFC FD Nov-2024"
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
                <label>Bank Name *</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g., HDFC Bank, SBI"
                  required
                />
              </div>

              <div className="form-field">
                <label>Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="XXXX1234"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="₹"
                  required
                />
              </div>

              <div className="form-field">
                <label>Current Value</label>
                <div className="input-with-live-indicator">
                  <input
                    type="number"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    placeholder="₹"
                  />
                  {/* Calculate theoretical value for badge */}
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

            <div className="form-row">
              <div className="form-field">
                <label>Interest Rate (%)</label>
                <div className="input-with-live-indicator">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="e.g., 7.25"
                  />
                  {getLiveRateForBank(formData.bankName) && (
                    <span className="live-badge" onClick={() => setFormData({ ...formData, interestRate: getLiveRateForBank(formData.bankName) })}>
                      Live: {getLiveRateForBank(formData.bankName)}%
                    </span>
                  )}
                </div>
                <small style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Current 1Y FD rate for {formData.bankName || 'bank'}
                </small>
              </div>

              <div className="form-field">
                <label>Frequency *</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  required
                >
                  <option value="one-time">One-time (FD)</option>
                  <option value="monthly">Monthly (RD)</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
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
              <div className="form-field full-width">
                <label>Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={resetForm}>Reset</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default BankSchemesInvestment;
