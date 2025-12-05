import { useEffect, useState } from 'react';
import { FiBarChart2, FiPieChart, FiCalendar, FiDollarSign, FiPlus } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { investmentAPI } from '../../../utils/investmentAPI';
import '../../investments/Investment.css';

const YearlyCalendar = () => {
  const [loading, setLoading] = useState(false);
  const [eventsPerMonth, setEventsPerMonth] = useState([]);
  const [billAmountPerMonth, setBillAmountPerMonth] = useState([]);
  const [categoryMix, setCategoryMix] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [summary, setSummary] = useState({ year: new Date().getFullYear(), totalEvents: 0, totalBillsAmount: 0, busiestMonth: '' });
  const [filters, setFilters] = useState({ year: new Date().getFullYear(), categories: ['daily-bill-checklist', 'daily-telephone-conversation'] });
  const [showBillForm, setShowBillForm] = useState(false);
  const [showCallForm, setShowCallForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [billInputs, setBillInputs] = useState({ billType: 'Electricity', provider: '', accountNumber: '', cycle: 'monthly', amount: 1000, dueDate: '', notes: '', startDate: new Date().toISOString().slice(0,10) });
  const [callInputs, setCallInputs] = useState({ contactName: '', phoneNumber: '', callType: 'Outgoing', dateTime: new Date().toISOString().slice(0,16), status: 'open', priority: 'medium', followUpDate: '', notes: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await investmentAPI.getYearlyCalendar(filters);
      const data = res.data || {};
      setEventsPerMonth(data.eventsPerMonth || []);
      setBillAmountPerMonth(data.billAmountPerMonth || []);
      setCategoryMix(data.categoryMix || []);
      setCalendar(data.calendar || []);
      setSummary(data.summary || { year: filters.year });
    } catch (e) {
      console.error('Error fetching yearly calendar:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters.year, filters.categories.join(',')]);

  const COLORS = ['#2563EB', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

  const toggleCategory = (cat) => {
    const set = new Set(filters.categories);
    if (set.has(cat)) set.delete(cat); else set.add(cat);
    setFilters({ ...filters, categories: Array.from(set) });
  };

  const billPayload = (data) => ({
    category: 'daily-bill-checklist',
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

  const callPayload = (data) => ({
    category: 'daily-telephone-conversation',
    type: 'Call',
    name: `${data.callType} - ${data.contactName || 'Unknown'}`,
    provider: data.phoneNumber || data.contactName || 'Contact',
    amount: 0,
    startDate: (data.dateTime ? new Date(data.dateTime) : new Date()).toISOString().slice(0, 10),
    maturityDate: data.followUpDate || undefined,
    frequency: 'one-time',
    notes: JSON.stringify({ ...data }),
  });

  const saveBill = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await investmentAPI.create(billPayload(billInputs));
      await fetchData();
      setShowBillForm(false);
      setBillInputs({ billType: 'Electricity', provider: '', accountNumber: '', cycle: 'monthly', amount: 1000, dueDate: '', notes: '', startDate: new Date().toISOString().slice(0,10) });
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving bill');
    } finally {
      setSaving(false);
    }
  };

  const saveCall = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await investmentAPI.create(callPayload(callInputs));
      await fetchData();
      setShowCallForm(false);
      setCallInputs({ contactName: '', phoneNumber: '', callType: 'Outgoing', dateTime: new Date().toISOString().slice(0,16), status: 'open', priority: 'medium', followUpDate: '', notes: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving call');
    } finally {
      setSaving(false);
    }
  };

  if (loading && eventsPerMonth.length === 0) {
    return (
      <div className="investment-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Yearly Calendar</h1>
        <div className="header-actions" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="form-field" style={{ margin: 0 }}>
            <label>Year</label>
            <input type="number" value={filters.year} onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })} style={{ width: 100 }} />
          </div>
          <div className="form-field" style={{ margin: 0 }}>
            <label>Categories</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={filters.categories.includes('daily-bill-checklist')} onChange={() => toggleCategory('daily-bill-checklist')} /> Bills
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={filters.categories.includes('daily-telephone-conversation')} onChange={() => toggleCategory('daily-telephone-conversation')} /> Calls
              </label>
            </div>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => setShowBillForm(!showBillForm)}
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
            <FiPlus style={{ color: 'white' }} /> {showBillForm ? 'Cancel Bill' : 'Add Bill'}
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setShowCallForm(!showCallForm)}
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
            <FiPlus style={{ color: 'white' }} /> {showCallForm ? 'Cancel Call' : 'Add Call'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiCalendar />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Events</p>
            <h3 className="stat-value">{summary.totalEvents}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Bills Amount</p>
            <h3 className="stat-value">₹{Math.round(summary.totalBillsAmount).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
            <FiCalendar />
          </div>
          <div className="stat-content">
            <p className="stat-label">Busiest Month</p>
            <h3 className="stat-value">{summary.busiestMonth || '-'}</h3>
          </div>
        </div>
      </div>

      {showBillForm && (
        <div className="investment-form-card">
          <h2>Add Bill</h2>
          <form className="investment-form" onSubmit={saveBill}>
            <div className="form-row">
              <div className="form-field">
                <label>Bill Type *</label>
                <select value={billInputs.billType} onChange={(e) => setBillInputs({ ...billInputs, billType: e.target.value })} required>
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
                <input type="text" value={billInputs.provider} onChange={(e) => setBillInputs({ ...billInputs, provider: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Account Number</label>
                <input type="text" value={billInputs.accountNumber} onChange={(e) => setBillInputs({ ...billInputs, accountNumber: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Cycle *</label>
                <select value={billInputs.cycle} onChange={(e) => setBillInputs({ ...billInputs, cycle: e.target.value })} required>
                  <option>monthly</option>
                  <option>quarterly</option>
                  <option>yearly</option>
                  <option>one-time</option>
                </select>
              </div>
              <div className="form-field">
                <label>Amount (₹) *</label>
                <input type="number" value={billInputs.amount} onChange={(e) => setBillInputs({ ...billInputs, amount: Number(e.target.value) })} required />
              </div>
              <div className="form-field">
                <label>Due Date *</label>
                <input type="date" value={billInputs.dueDate} onChange={(e) => setBillInputs({ ...billInputs, dueDate: e.target.value })} required />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-success" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Bill'}</button>
            </div>
          </form>
        </div>
      )}

      {showCallForm && (
        <div className="investment-form-card">
          <h2>Add Call</h2>
          <form className="investment-form" onSubmit={saveCall}>
            <div className="form-row">
              <div className="form-field">
                <label>Contact Name *</label>
                <input type="text" value={callInputs.contactName} onChange={(e) => setCallInputs({ ...callInputs, contactName: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Phone Number *</label>
                <input type="tel" value={callInputs.phoneNumber} onChange={(e) => setCallInputs({ ...callInputs, phoneNumber: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Call Type *</label>
                <select value={callInputs.callType} onChange={(e) => setCallInputs({ ...callInputs, callType: e.target.value })} required>
                  <option>Outgoing</option>
                  <option>Incoming</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Date & Time *</label>
                <input type="datetime-local" value={callInputs.dateTime} onChange={(e) => setCallInputs({ ...callInputs, dateTime: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Follow-up Date</label>
                <input type="date" value={callInputs.followUpDate} onChange={(e) => setCallInputs({ ...callInputs, followUpDate: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Priority</label>
                <select value={callInputs.priority} onChange={(e) => setCallInputs({ ...callInputs, priority: e.target.value })}>
                  <option>low</option>
                  <option>medium</option>
                  <option>high</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Status</label>
                <select value={callInputs.status} onChange={(e) => setCallInputs({ ...callInputs, status: e.target.value })}>
                  <option>open</option>
                  <option>closed</option>
                </select>
              </div>
              <div className="form-field">
                <label>Notes</label>
                <input type="text" value={callInputs.notes} onChange={(e) => setCallInputs({ ...callInputs, notes: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-success" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Call'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="charts-section">
        <div className="charts-header">
          <h2>Monthly Overview</h2>
          <p>Event counts and bill amounts</p>
        </div>
        <div className="charts-grid">
          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Events per Month</h3>
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={eventsPerMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#2563EB" name="Count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Bills Amount</h3>
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={billAmountPerMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, 'Amount']} />
                  <Legend />
                  <Bar dataKey="amount" fill="#10B981" name="Amount" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiPieChart className="chart-icon" />
                <h3>Category Mix</h3>
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={categoryMix} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {categoryMix.map((entry, idx) => (
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
          <h2>Calendar Grid</h2>
        </div>
        <div className="table-container">
          <table className="investments-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Days</th>
                <th>Count</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {calendar.map((m, idx) => (
                <tr key={idx}>
                  <td>{m.name}</td>
                  <td>
                    {Object.keys(m.days).length === 0 ? '-' : (
                      Object.keys(m.days).sort((a,b) => Number(a) - Number(b)).map((day) => (
                        <div key={day} style={{ marginBottom: 6 }}>
                          <strong style={{ marginRight: 8 }}>{day}</strong>
                          {m.days[day].map((ev, i) => (
                            <span key={i} style={{ marginRight: 10, color: '#64748b' }}>
                              [{ev.category.includes('bill') ? 'Bill' : 'Call'}] {ev.title} {ev.subtitle ? `- ${ev.subtitle}` : ''}
                            </span>
                          ))}
                        </div>
                      ))
                    )}
                  </td>
                  <td>{m.count}</td>
                  <td>₹{Math.round(m.amount).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default YearlyCalendar;
