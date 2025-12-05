import { useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiDollarSign, FiActivity } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { investmentAPI } from '../../utils/investmentAPI';
import './Investment.css';

const InvestmentValuationAllocation = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const allRes = await investmentAPI.getAll();
        setInvestments(allRes.data.investments || []);
      } catch (error) {
        console.error('Error fetching investments:', error);
        setInvestments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totals = useMemo(() => {
    const invested = investments.reduce((sum, inv) => {
      if (typeof inv.amount === 'number' && inv.amount > 0) return sum + inv.amount;
      if (inv.quantity && inv.purchasePrice) return sum + inv.quantity * inv.purchasePrice;
      return sum;
    }, 0);

    const current = investments.reduce((sum, inv) => {
      if (inv.currentValue && inv.quantity) return sum + inv.currentValue * inv.quantity;
      if (typeof inv.currentValue === 'number') return sum + inv.currentValue;
      if (typeof inv.amount === 'number') return sum + inv.amount;
      return sum;
    }, 0);

    const returns = current - invested;
    const returnsPercent = invested > 0 ? ((returns / invested) * 100).toFixed(2) : 0;
    return { invested, current, returns, returnsPercent };
  }, [investments]);

  const categoryAgg = useMemo(() => {
    const map = new Map();
    for (const inv of investments) {
      const key = inv.category || 'others';
      const invested = (typeof inv.amount === 'number' && inv.amount > 0)
        ? inv.amount
        : (inv.quantity && inv.purchasePrice) ? inv.quantity * inv.purchasePrice : 0;
      const current = inv.currentValue && inv.quantity
        ? inv.currentValue * inv.quantity
        : (typeof inv.currentValue === 'number') ? inv.currentValue : invested;

      const prev = map.get(key) || { name: key, invested: 0, current: 0, count: 0 };
      prev.invested += invested;
      prev.current += current;
      prev.count += 1;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [investments]);

  const categoryPie = useMemo(() => categoryAgg.map(c => ({ name: c.name, value: c.current })), [categoryAgg]);

  const providerAgg = useMemo(() => {
    const map = new Map();
    for (const inv of investments) {
      const key = inv.provider || 'Unknown';
      const current = inv.currentValue && inv.quantity
        ? inv.currentValue * inv.quantity
        : (typeof inv.currentValue === 'number') ? inv.currentValue : (inv.amount || 0);
      const prev = map.get(key) || { name: key, value: 0 };
      prev.value += current;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [investments]);

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Investment Valuation & Sectoral Allocation</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Invested</p>
            <h3 className="stat-value">₹{totals.invested.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Current Value</p>
            <h3 className="stat-value">₹{totals.current.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <FiActivity />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Returns</p>
            <h3 className="stat-value" style={{ color: totals.returns >= 0 ? '#10B981' : '#EF4444' }}>
              ₹{totals.returns.toLocaleString('en-IN')} ({totals.returnsPercent}%)
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' }}>
            <FiPieChart />
          </div>
          <div className="stat-content">
            <p className="stat-label">Categories</p>
            <h3 className="stat-value">{categoryAgg.length}</h3>
          </div>
        </div>
      </div>

      {investments.length > 0 && (
        <div className="charts-section">
          <div className="charts-header">
            <h2>Portfolio Analytics</h2>
            <p>Valuation summary aur category-wise allocation</p>
          </div>

          <div className="charts-grid">
            <div className="chart-card premium">
              <div className="chart-header">
                <div className="chart-title">
                  <FiPieChart className="chart-icon" />
                  <h3>Allocation by Category</h3>
                </div>
                <div className="chart-subtitle">Current value distribution</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={categoryPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                      {categoryPie.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="#fff" strokeWidth={2} />
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
                  <h3>Category Performance</h3>
                </div>
                <div className="chart-subtitle">Invested vs Current</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={categoryAgg} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']} />
                    <Legend />
                    <Bar dataKey="invested" fill="#2563EB" name="Invested" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="current" fill="#10B981" name="Current" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card premium full-width">
              <div className="chart-header">
                <div className="chart-title">
                  <FiActivity className="chart-icon" />
                  <h3>Provider Allocation</h3>
                </div>
                <div className="chart-subtitle">Portfolio value per provider</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={providerAgg} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6D28D9" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Portfolio Value']} />
                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fill="url(#areaGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {categoryAgg.length > 0 && (
        <div className="table-container">
          <h2>Category Summary</h2>
          <table className="investments-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Invested</th>
                <th>Current</th>
                <th>Returns</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {categoryAgg.map((c) => {
                const returns = c.current - c.invested;
                const rp = c.invested > 0 ? ((returns / c.invested) * 100).toFixed(2) : 0;
                return (
                  <tr key={c.name}>
                    <td>
                      <span className="investment-type-badge" style={{ 
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                      }}>
                        {c.name}
                      </span>
                    </td>
                    <td>₹{c.invested.toLocaleString('en-IN')}</td>
                    <td>₹{c.current.toLocaleString('en-IN')}</td>
                    <td style={{ color: returns >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                      ₹{returns.toLocaleString('en-IN')} ({rp}%)
                    </td>
                    <td>{c.count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {investments.length === 0 && !loading && (
        <div className="empty-state">
          <p>Portfolio empty lag raha hai. Investments add karke valuation dekhein.</p>
        </div>
      )}
    </div>
  );
};

export default InvestmentValuationAllocation;
