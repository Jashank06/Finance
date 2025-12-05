import { useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiPieChart, FiCalendar, FiClock, FiDollarSign, FiPlus } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { investmentAPI } from '../../../utils/investmentAPI';
import '../../investments/Investment.css';

const BillDates = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthlyProvisions, setMonthlyProvisions] = useState([]);
  const [cycleMix, setCycleMix] = useState([]);
  const [yearlySchedule, setYearlySchedule] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [annualTotal, setAnnualTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inputs, setInputs] = useState({
    billType: 'Electricity',
    provider: '',
    accountNumber: '',
    cycle: 'monthly',
    amount: 1000,
    dueDate: '',
    autoDebit: false,
    paymentMethod: 'UPI',
    status: 'pending',
    reminderDays: 3,
    notes: '',
    startDate: new Date().toISOString().slice(0, 10),
  });

  const CATEGORY_KEY = 'daily-bill-checklist';

  const fromInvestment = (inv) => {
    let notes = {};
    try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
    return {
      _id: inv._id,
      billType: notes.billType || 'Bill',
      provider: inv.provider || notes.provider || '',
      accountNumber: inv.accountNumber || notes.accountNumber || '',
      cycle: inv.frequency || notes.cycle || 'monthly',
      amount: inv.amount || notes.amount || 0,
      dueDate: inv.maturityDate?.slice(0,10) || notes.dueDate || '',
      autoDebit: notes.autoDebit || false,
      status: notes.status || 'pending',
      startDate: inv.startDate?.slice(0,10) || notes.startDate || '',
    };
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      // Prefer backend analytics for performance
      const analytics = await investmentAPI.getBillDatesAnalytics();
      const a = analytics.data || {};
      if (a.monthlyProvisions && a.cycleMix && a.yearlySchedule && a.upcoming) {
        setMonthlyProvisions(a.monthlyProvisions);
        setCycleMix(a.cycleMix);
        setYearlySchedule(a.yearlySchedule);
        setUpcoming(a.upcoming);
        setAnnualTotal((a.summary && a.summary.annualTotal) || 0);
        setEntries([]);
        return;
      }
      // Fallback to client-side aggregation if analytics not available
      const res = await investmentAPI.getAll(CATEGORY_KEY);
      const list = (res.data.investments || []).map(fromInvestment);
      setEntries(list);
    } catch (e) {
      console.error('Error fetching bill dates:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const now = new Date();
  const currentYear = now.getFullYear();

  const toPayload = (data) => ({
    category: CATEGORY_KEY,
    type: 'Bill',
    name: `${data.billType} - ${data.provider || data.accountNumber || ''}`.trim(),
    provider: data.provider || data.billType,
    accountNumber: data.accountNumber || '',
    amount: Number(data.amount) || 0,
    startDate: data.startDate || new Date().toISOString().slice(0, 10),
    maturityDate: data.dueDate || undefined,
    frequency: data.cycle || 'monthly',
    notes: JSON.stringify({ ...data }),
  });

  const monthlyProvisionsLocal = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      idx: i,
      key: `${currentYear}-${i+1}`,
      name: new Date(currentYear, i, 1).toLocaleString('en-US', { month: 'short' }),
      total: 0,
    }));

    const addToMonth = (monthIdx, amt) => {
      if (monthIdx >= 0 && monthIdx < 12) months[monthIdx].total += amt;
    };

    for (const e of entries) {
      const amt = Number(e.amount) || 0;
      if (!amt) continue;
      const due = e.dueDate ? new Date(e.dueDate) : null;
      const start = e.startDate ? new Date(e.startDate) : null;
      const startMonth = start && start.getFullYear() === currentYear ? start.getMonth() : 0;
      const baseMonth = due && due.getFullYear() === currentYear ? due.getMonth() : startMonth;
      if (e.cycle === 'monthly') {
        for (let m = Math.max(0, startMonth); m < 12; m++) addToMonth(m, amt);
      } else if (e.cycle === 'quarterly') {
        const first = Math.max(0, baseMonth);
        for (let m = first; m < 12; m += 3) addToMonth(m, amt);
      } else if (e.cycle === 'yearly' || e.cycle === 'one-time') {
        addToMonth(Math.max(0, baseMonth), amt);
      } else {
        addToMonth(Math.max(0, baseMonth), amt);
      }
    }

    return months.map(m => ({ name: m.name, total: m.total }));
  }, [entries, currentYear]);

  const annualTotalLocal = useMemo(() => monthlyProvisionsLocal.reduce((s, m) => s + m.total, 0), [monthlyProvisionsLocal]);

  const cycleMixLocal = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = e.cycle || 'monthly';
      const prev = map.get(key) || { name: key, value: 0 };
      prev.value += 1;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [entries]);

  const yearlyScheduleLocal = useMemo(() => {
    const byMonth = Array.from({ length: 12 }, (_, i) => ({
      monthIdx: i,
      name: new Date(currentYear, i, 1).toLocaleString('en-US', { month: 'long' }),
      items: [],
      total: 0,
    }));
    for (const e of entries) {
      if (!e.dueDate) continue;
      const d = new Date(e.dueDate);
      if (d.getFullYear() !== currentYear) continue;
      const bucket = byMonth[d.getMonth()];
      bucket.items.push({
        day: d.getDate(),
        provider: e.provider || e.billType,
        billType: e.billType,
        cycle: e.cycle,
        amount: Number(e.amount) || 0,
      });
      bucket.total += Number(e.amount) || 0;
    }
    for (const m of byMonth) {
      m.items.sort((a, b) => a.day - b.day);
    }
    return byMonth;
  }, [entries, currentYear]);

  const upcomingLocal = useMemo(() => {
    const horizon = 60; // days
    const end = new Date(now);
    end.setDate(end.getDate() + horizon);
    const list = [];
    for (const e of entries) {
      if (!e.dueDate) continue;
      const d = new Date(e.dueDate);
      if (d >= now && d <= end) {
        list.push({
          date: d.toISOString().slice(0,10),
          provider: e.provider || e.billType,
          billType: e.billType,
          amount: Number(e.amount) || 0,
          cycle: e.cycle,
        });
      }
    }
    list.sort((a, b) => (a.date > b.date ? 1 : -1));
    return list;
  }, [entries]);

  const COLORS = ['#2563EB', '#10B981', '#EF4444', '#8B5CF6'];

  if (loading && entries.length === 0) {
    return (
      <div className="investment-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Bill Dates: Monthly Provisions & Yearly Schedule</h1>
        <div className="header-actions">
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(!showForm)}
            style={{ 
              background: 'linear-gradient(135deg, #9333EA 0%, #C084FC 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiPlus style={{ color: 'white' }} /> {showForm ? 'Cancel' : 'Add Bill'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Annual Provisions</p>
            <h3 className="stat-value">₹{Math.round((annualTotal || annualTotalLocal)).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiClock />
          </div>
          <div className="stat-content">
            <p className="stat-label">Upcoming (60 days)</p>
            <h3 className="stat-value">₹{Math.round((upcoming.length ? upcoming.reduce((s, i) => s + i.amount, 0) : upcomingLocal.reduce((s, i) => s + i.amount, 0))).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
            <FiCalendar />
          </div>
          <div className="stat-content">
            <p className="stat-label">Scheduled This Year</p>
            <h3 className="stat-value">{(yearlySchedule.length ? yearlySchedule : yearlyScheduleLocal).reduce((s, m) => s + m.items.length, 0)}</h3>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="charts-header">
          <h2>Provisions & Cycle Mix</h2>
          <p>Month-wise totals and cycle distribution</p>
        </div>
        <div className="charts-grid">
          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Monthly Provisions</h3>
              </div>
              <div className="chart-subtitle">Budgeted amounts per month</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={(monthlyProvisions.length ? monthlyProvisions : monthlyProvisionsLocal)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, 'Total']} />
                  <Legend />
                  <Bar dataKey="total" fill="#2563EB" name="Total" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiPieChart className="chart-icon" />
                <h3>Cycle Mix</h3>
              </div>
              <div className="chart-subtitle">Monthly vs Quarterly vs Yearly</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={(cycleMix.length ? cycleMix : cycleMixLocal)} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {(cycleMix.length ? cycleMix : cycleMixLocal).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="investments-table-card">
        <div className="table-header">
          <h2>Yearly Schedule</h2>
        </div>
        <div className="table-container">
          <table className="investments-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(yearlySchedule.length ? yearlySchedule : yearlyScheduleLocal).map((m, idx) => (
                <tr key={idx}>
                  <td>{m.name}</td>
                  <td>
                    {m.items.length === 0 ? '-' : m.items.map((it, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ minWidth: 28 }}>{String(it.day).padStart(2, '0')}</span>
                        <span style={{ flex: 1 }}>{it.provider} ({it.billType})</span>
                        <span style={{ minWidth: 80, textAlign: 'right' }}>₹{Math.round(it.amount).toLocaleString('en-IN')}</span>
                        <span style={{ minWidth: 80, textAlign: 'right', color: '#64748b' }}>{it.cycle}</span>
                      </div>
                    ))}
                  </td>
                  <td>₹{Math.round(m.total).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="investments-table-card">
        <div className="table-header">
          <h2>Upcoming (Next 60 days)</h2>
        </div>
        <div className="table-container">
          <table className="investments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Provider</th>
                <th>Type</th>
                <th>Cycle</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(upcoming.length ? upcoming : upcomingLocal).map((u, idx) => (
                <tr key={idx}>
                  <td>{u.date}</td>
                  <td>{u.provider}</td>
                  <td>{u.billType}</td>
                  <td>{u.cycle}</td>
                  <td>₹{Math.round(u.amount).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="investment-form-card">
          <h2>Add Bill</h2>
          <form className="investment-form" onSubmit={async (e) => {
            e.preventDefault();
            try {
              setSaving(true);
              await investmentAPI.create(toPayload(inputs));
              await fetchEntries();
              setInputs({ billType: 'Electricity', provider: '', accountNumber: '', cycle: 'monthly', amount: 1000, dueDate: '', autoDebit: false, paymentMethod: 'UPI', status: 'pending', reminderDays: 3, notes: '', startDate: new Date().toISOString().slice(0,10) });
              setShowForm(false);
            } catch (error) {
              alert(error.response?.data?.message || 'Error saving bill');
            } finally {
              setSaving(false);
            }
          }}>
            <div className="form-row">
              <div className="form-field">
                <label>Bill Type *</label>
                <select value={inputs.billType} onChange={(e) => setInputs({ ...inputs, billType: e.target.value })} required>
                  <option>Electricity</option>
                  <option>Water</option>
                  <option>Gas</option>
                  <option>Internet</option>
                  <option>Mobile</option>
                  <option>Credit Card</option>
                  <option>Rent</option>
                  <option>Insurance</option>
                  <option>School Fees</option>
                  <option>Maintenance</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>Provider *</label>
                <input type="text" value={inputs.provider} onChange={(e) => setInputs({ ...inputs, provider: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Account Number</label>
                <input type="text" value={inputs.accountNumber} onChange={(e) => setInputs({ ...inputs, accountNumber: e.target.value })} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Cycle *</label>
                <select value={inputs.cycle} onChange={(e) => setInputs({ ...inputs, cycle: e.target.value })} required>
                  <option>monthly</option>
                  <option>quarterly</option>
                  <option>yearly</option>
                  <option>one-time</option>
                </select>
              </div>
              <div className="form-field">
                <label>Amount (₹) *</label>
                <input type="number" value={inputs.amount} onChange={(e) => setInputs({ ...inputs, amount: Number(e.target.value) })} required />
              </div>
              <div className="form-field">
                <label>Due Date *</label>
                <input type="date" value={inputs.dueDate} onChange={(e) => setInputs({ ...inputs, dueDate: e.target.value })} required />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-success" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BillDates;
