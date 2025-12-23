import { useState, useEffect, useRef, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiDollarSign, FiPieChart, FiActivity, FiBarChart2, FiRefreshCw } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, BarChart, Bar } from 'recharts';
import { investmentAPI } from '../../utils/investmentAPI';
import { staticAPI } from '../../utils/staticAPI';
import { fetchLiveMetalPrices, fetchSGBPrice } from '../../utils/livePricesAPI';
import './Investment.css';
import { syncContactsFromForm } from '../../utils/contactSyncUtil';
import { syncBillScheduleFromForm } from '../../utils/billScheduleSyncUtil';
import { syncInvestmentProfileFromForm } from '../../utils/syncInvestmentProfileUtil';

const GoldSgbInvestment = () => {
  const [investments, setInvestments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const formRef = useRef(null);
  const [livePrices, setLivePrices] = useState(null);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState(null);
  const [formData, setFormData] = useState({
    category: 'gold-sgb',
    type: 'Digital Gold',
    name: '',
    provider: '',
    quantity: '',
    purchasePrice: '',
    currentValue: '',
    purchaseDate: '',
    maturityDate: '',
    interestRate: '',
    purity: '',
    storageType: 'digital',
    nameOfInvestor: '',
    subBroker: '',
    notes: '',
  });

  const COLORS = ['#FFD700', '#FFA500', '#C0C0C0', '#4169E1', '#32CD32', '#FF6347'];

  // Fetch live prices
  const fetchPrices = async () => {
    setPricesLoading(true);
    try {
      const [metalPrices, sgbPrice] = await Promise.all([
        fetchLiveMetalPrices(),
        fetchSGBPrice()
      ]);
      setLivePrices({ ...metalPrices, sgb: sgbPrice });
      setLastPriceUpdate(new Date());
    } catch (error) {
      console.error('Error fetching live prices:', error);
    } finally {
      setPricesLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
    fetchFamilyMembers();
    fetchPrices();

    // Auto-refresh prices every 5 minutes
    const priceInterval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(priceInterval);
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
    // Auto-scroll to form when it's shown
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await investmentAPI.getAll('gold-sgb');
      setInvestments(response.data.investments || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
      // Mock data for demonstration
      setInvestments([
        {
          _id: '1',
          category: 'gold-sgb',
          type: 'Digital Gold',
          name: 'MMTC-PAMP Digital Gold',
          provider: 'MMTC-PAMP',
          quantity: 10,
          purchasePrice: 55000,
          currentValue: 58000,
          purchaseDate: '2024-01-15',
          purity: '24K',
          storageType: 'digital',
          notes: 'Monthly investment plan'
        },
        {
          _id: '2',
          category: 'gold-sgb',
          type: 'SGB',
          name: 'Sovereign Gold Bond 2023',
          provider: 'RBI',
          quantity: 1,
          purchasePrice: 60000,
          currentValue: 62000,
          purchaseDate: '2023-12-01',
          maturityDate: '2033-12-01',
          interestRate: 2.5,
          purity: '24K',
          storageType: 'digital',
          notes: '8-year tenure with 2.5% interest'
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
        ...formData,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        currentValue: parseFloat(formData.currentValue) || parseFloat(formData.purchasePrice),
        interestRate: parseFloat(formData.interestRate) || 0,
        startDate: formData.purchaseDate, // Map to backend field
      };

      // Remove purchaseDate as backend expects startDate
      delete dataToSend.purchaseDate;

      if (editingId) {
        await investmentAPI.update(editingId, dataToSend);
      } else {
        await investmentAPI.create(dataToSend);
      }

      // Sync to other modules
      await Promise.all([
        syncContactsFromForm(formData, 'GoldSgbInvestment'),
        syncBillScheduleFromForm(formData, 'GoldSgbInvestment'),
        syncInvestmentProfileFromForm(formData, 'GoldSgbInvestment')
      ]);

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
      provider: investment.provider || '',
      quantity: investment.quantity,
      purchasePrice: investment.purchasePrice,
      currentValue: investment.currentValue || investment.purchasePrice,
      purchaseDate: investment.startDate?.split('T')[0] || '', // Map from backend field
      maturityDate: investment.maturityDate?.split('T')[0] || '',
      interestRate: investment.interestRate || '',
      purity: investment.purity || '',
      storageType: investment.storageType || 'digital',
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
      category: 'gold-sgb',
      type: 'Digital Gold',
      name: '',
      provider: '',
      quantity: '',
      purchasePrice: '',
      currentValue: '',
      purchaseDate: '',
      maturityDate: '',
      interestRate: '',
      purity: '',
      storageType: 'digital',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const calculateTotals = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + (inv.currentValue * inv.quantity), 0);
    const totalReturns = totalCurrent - totalInvested;
    const returnsPercent = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : 0;
    const totalQuantity = investments.reduce((sum, inv) => sum + inv.quantity, 0);

    return { totalInvested, totalCurrent, totalReturns, returnsPercent, totalQuantity };
  };

  const getChartData = () => {
    const typeData = investments.reduce((acc, inv) => {
      const existing = acc.find(item => item.name === inv.type);
      const value = inv.currentValue * inv.quantity;
      if (existing) {
        existing.value += value;
      } else {
        acc.push({ name: inv.type, value });
      }
      return acc;
    }, []);
    return typeData;
  };

  const getPerformanceData = () => {
    return investments.map(inv => ({
      name: inv.name.length > 15 ? inv.name.substring(0, 15) + '...' : inv.name,
      invested: inv.purchasePrice * inv.quantity,
      current: inv.currentValue * inv.quantity,
      returns: (inv.currentValue - inv.purchasePrice) * inv.quantity,
      returnsPercent: inv.purchasePrice > 0 ? ((inv.currentValue - inv.purchasePrice) / inv.purchasePrice * 100).toFixed(2) : 0
    }));
  };

  const getProviderData = () => {
    const providerData = investments.reduce((acc, inv) => {
      const existing = acc.find(item => item.name === inv.provider);
      const value = inv.currentValue * inv.quantity;
      if (existing) {
        existing.value += value;
        existing.quantity += inv.quantity;
      } else {
        acc.push({ name: inv.provider, value, quantity: inv.quantity });
      }
      return acc;
    }, []);
    return providerData;
  };

  const totals = calculateTotals();
  const chartData = getChartData();
  const performanceData = getPerformanceData();
  const providerData = getProviderData();

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Gold / SGB / Silver / Bonds Investments</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Add Investment'}
          </button>
        </div>
      </div>

      {/* Live Market Prices */}
      <div className="live-prices-section" style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
        borderRadius: '16px', 
        padding: '20px', 
        marginBottom: '24px',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', animation: 'pulse 2s infinite' }}></span>
            Live Market Prices
          </h3>
          <button 
            onClick={fetchPrices} 
            disabled={pricesLoading}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '8px 16px', 
              color: '#fff', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiRefreshCw className={pricesLoading ? 'spin' : ''} />
            {pricesLoading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', opacity: 0.9 }}>Gold 24K</p>
            <h4 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
              ₹{livePrices?.gold?.price24K?.toLocaleString('en-IN') || '--'}
            </h4>
            <small style={{ opacity: 0.8 }}>per gram</small>
          </div>
          
          <div style={{ background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', opacity: 0.9 }}>Gold 22K</p>
            <h4 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
              ₹{livePrices?.gold?.price22K?.toLocaleString('en-IN') || '--'}
            </h4>
            <small style={{ opacity: 0.8 }}>per gram</small>
          </div>
          
          <div style={{ background: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)', borderRadius: '12px', padding: '16px', color: '#1a1a2e' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', opacity: 0.9 }}>Silver</p>
            <h4 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
              ₹{livePrices?.silver?.pricePerKg?.toLocaleString('en-IN') || '--'}
            </h4>
            <small style={{ opacity: 0.8 }}>per kg</small>
          </div>
          
          <div style={{ background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', opacity: 0.9 }}>SGB Issue Price</p>
            <h4 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
              ₹{livePrices?.sgb?.issuePrice?.toLocaleString('en-IN') || '--'}
            </h4>
            <small style={{ opacity: 0.8 }}>2.5% p.a. interest</small>
          </div>
        </div>
        
        {lastPriceUpdate && (
          <p style={{ margin: '12px 0 0', fontSize: '11px', opacity: 0.6, textAlign: 'right' }}>
            Last updated: {lastPriceUpdate.toLocaleTimeString('en-IN')} | Auto-refresh every 5 min
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Invested</p>
            <h3 className="stat-value">₹{totals.totalInvested.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #C0C0C0 0%, #4169E1 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Current Value</p>
            <h3 className="stat-value">₹{totals.totalCurrent.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Returns</p>
            <h3 className="stat-value" style={{ color: totals.totalReturns >= 0 ? '#32CD32' : '#FF6347' }}>
              ₹{totals.totalReturns.toLocaleString('en-IN')} ({totals.returnsPercent}%)
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FF6347 0%, #DC143C 100%)' }}>
            <FiActivity />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Quantity</p>
            <h3 className="stat-value">{totals.totalQuantity} Units</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      {investments.length > 0 && (
        <div className="charts-section">
          <div className="charts-header">
            <h2>Portfolio Analytics</h2>
            <p>Comprehensive visualization of your Gold & SGB investments</p>
          </div>

          <div className="charts-grid">
            <div className="chart-card premium">
              <div className="chart-header">
                <div className="chart-title">
                  <FiTrendingUp className="chart-icon" />
                  <h3>Investment Distribution</h3>
                </div>
                <div className="chart-subtitle">By investment type</div>
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
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell - ${index} `}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')} `, 'Value']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    />
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
                  <BarChart
                    data={performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FFA500" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#32CD32" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#228B22" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)} K`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')} `, '']}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    />
                    <Bar
                      dataKey="invested"
                      fill="url(#investedGradient)"
                      name="Invested Amount"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="current"
                      fill="url(#currentGradient)"
                      name="Current Value"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card premium full-width">
              <div className="chart-header">
                <div className="chart-title">
                  <FiActivity className="chart-icon" />
                  <h3>Provider Portfolio Distribution</h3>
                </div>
                <div className="chart-subtitle">Investment allocation by provider/platform</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={providerData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C084FC" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#9333EA" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)} K`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')} `, 'Portfolio Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#C084FC"
                      strokeWidth={3}
                      fill="url(#areaGradient)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table View - Always show after charts */}
      {investments.length > 0 && (
        <div className="table-container">
          <h2>Investment Details</h2>
          <table className="investments-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Provider</th>
                <th>Quantity</th>
                <th>Purchase Price</th>
                <th>Current Value</th>
                <th>Returns</th>
                <th>Purity</th>
                <th>Purchase Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((investment) => {
                const investedAmount = investment.purchasePrice * investment.quantity;
                const currentAmount = investment.currentValue * investment.quantity;
                const returns = currentAmount - investedAmount;
                const returnsPercent = investedAmount > 0 ? ((returns / investedAmount) * 100).toFixed(2) : 0;

                return (
                  <tr key={investment._id}>
                    <td>
                      <span className="investment-type-badge" style={{
                        background: investment.type.includes('Gold') ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
                          investment.type.includes('Silver') ? 'linear-gradient(135deg, #C0C0C0 0%, #4169E1 100%)' :
                            'linear-gradient(135deg, #C084FC 0%, #9333EA 100%)'
                      }}>
                        {investment.type}
                      </span>
                    </td>
                    <td>{investment.name}</td>
                    <td>{investment.provider}</td>
                    <td>{investment.quantity} {investment.type.includes('Gold') || investment.type.includes('Silver') ? 'gms' : 'units'}</td>
                    <td>₹{investedAmount.toLocaleString('en-IN')}</td>
                    <td>₹{currentAmount.toLocaleString('en-IN')}</td>
                    <td style={{ color: returns >= 0 ? '#32CD32' : '#FF6347', fontWeight: 600 }}>
                      ₹{returns.toLocaleString('en-IN')} ({returnsPercent}%)
                    </td>
                    <td>{investment.purity || 'N/A'}</td>
                    <td>{new Date(investment.startDate).toLocaleDateString('en-IN')}</td>
                    <td>
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

      {/* Empty State */}
      {investments.length === 0 && !loading && (
        <div className="empty-state">
          <p>No investments found. Add your first investment to get started!</p>
        </div>
      )}

      {/* Form */}
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
                  <option value="Digital Gold">Digital Gold</option>
                  <option value="Physical Gold">Physical Gold (Coins/Bars)</option>
                  <option value="Gold Jewelry">Gold Jewelry</option>
                  <option value="SGB">Sovereign Gold Bond (SGB)</option>
                  <option value="Silver">Silver (Coins/Bars)</option>
                  <option value="Government Bonds">Government Bonds</option>
                  <option value="Corporate Bonds">Corporate Bonds</option>
                  <option value="ETF">Gold/Silver ETF</option>
                </select>
              </div>

              <div className="form-field">
                <label>Investment Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., MMTC-PAMP Digital Gold"
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
                <label>Provider/Platform *</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g., MMTC-PAMP, RBI, HDFC Securities"
                  required
                />
              </div>

              <div className="form-field">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Quantity in grams/units"
                  step="0.001"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Purchase Price per Unit *</label>
                <input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  placeholder="Price per gram/unit"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-field">
                <label>Current Value per Unit</label>
                <input
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="Current market price"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Purchase Date *</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
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
                  placeholder="For bonds/SGB"
                  step="0.01"
                />
              </div>

              <div className="form-field">
                <label>Purity</label>
                <select
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                >
                  <option value="">Select Purity</option>
                  <option value="24K">24K (99.9%)</option>
                  <option value="22K">22K (91.6%)</option>
                  <option value="18K">18K (75%)</option>
                  <option value="14K">14K (58.5%)</option>
                  <option value="Silver">Silver (99.9%)</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Storage Type</label>
                <select
                  value={formData.storageType}
                  onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                >
                  <option value="digital">Digital</option>
                  <option value="physical">Physical (Home)</option>
                  <option value="bank-locker">Bank Locker</option>
                  <option value="vault">Secure Vault</option>
                  <option value="demat">Demat Account</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details, purchase purpose, etc."
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

    </div>
  );
};

export default GoldSgbInvestment;
