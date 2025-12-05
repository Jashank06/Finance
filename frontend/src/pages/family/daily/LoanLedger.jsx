import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBarChart2, FiPieChart, FiDollarSign, FiTrendingUp, FiActivity, FiUsers } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { investmentAPI } from '../../../utils/investmentAPI';
import '../../investments/Investment.css';

const LoanLedger = () => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [inputs, setInputs] = useState({
    partyName: '',
    relation: '',
    type: 'Lent',
    principal: 100000,
    interestRate: 12,
    interestType: 'simple',
    frequency: 'monthly',
    startDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    collateral: '',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm]);

  const CATEGORY_KEY = 'daily-loan-ledger';

  const toPayload = (data) => ({
    category: CATEGORY_KEY,
    type: data.type,
    name: `${data.type} - ${data.partyName || 'Party'}`,
    provider: data.partyName || 'Party',
    amount: Number(data.principal) || 0,
    interestRate: Number(data.interestRate) || 0,
    startDate: data.startDate || new Date().toISOString().slice(0, 10),
    maturityDate: data.dueDate || undefined,
    frequency: data.frequency || 'monthly',
    notes: JSON.stringify({ ...data }),
  });

  const fromInvestment = (inv) => {
    let notes = {};
    try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
    return { _id: inv._id, ...notes, principal: inv.amount, interestRate: inv.interestRate, startDate: inv.startDate?.slice(0,10) || notes.startDate, dueDate: inv.maturityDate?.slice(0,10) || notes.dueDate };
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await investmentAPI.getAll(CATEGORY_KEY);
      const list = (res.data.investments || []).map(fromInvestment);
      setEntries(list);
    } catch (e) {
      console.error('Error fetching loan ledger:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const calcDurationYears = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(0, (e - s) / (1000 * 60 * 60 * 24 * 365));
  };

  const totals = useMemo(() => {
    let lent = 0, borrowed = 0;
    for (const e of entries) {
      if (e.type === 'Lent') lent += Number(e.principal) || 0; else borrowed += Number(e.principal) || 0;
    }
    return { lent, borrowed, net: lent - borrowed, count: entries.length };
  }, [entries]);

  const partyAgg = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = e.partyName || 'Unknown';
      const prev = map.get(key) || { name: key, lent: 0, borrowed: 0 };
      if (e.type === 'Lent') prev.lent += Number(e.principal) || 0; else prev.borrowed += Number(e.principal) || 0;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [entries]);

  const COLORS = ['#2563EB', '#10B981', '#EF4444', '#8B5CF6'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await investmentAPI.update(editingId, toPayload(inputs));
      } else {
        await investmentAPI.create(toPayload(inputs));
      }
      await fetchEntries();
      setEditingId(null);
      setInputs({
        partyName: '', relation: '', type: 'Lent', principal: 100000, interestRate: 12, interestType: 'simple', frequency: 'monthly', startDate: new Date().toISOString().slice(0,10), dueDate: '', collateral: '', status: 'active', notes: ''
      });
      setShowForm(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving record');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (index) => {
    const item = entries[index];
    setInputs({
      partyName: item.partyName || '',
      relation: item.relation || '',
      type: item.type || 'Lent',
      principal: item.principal || 0,
      interestRate: item.interestRate || 0,
      interestType: item.interestType || 'simple',
      frequency: item.frequency || 'monthly',
      startDate: item.startDate || new Date().toISOString().slice(0,10),
      dueDate: item.dueDate || '',
      collateral: item.collateral || '',
      status: item.status || 'active',
      notes: item.notes || '',
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    const item = entries[index];
    if (window.confirm('Delete this record?')) {
      try {
        await investmentAPI.delete(item._id);
        await fetchEntries();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting record');
      }
    }
  };

  const schedulePoints = useMemo(() => {
    const s = inputs.startDate;
    const d = inputs.dueDate;
    const years = calcDurationYears(s, d);
    const months = Math.max(1, Math.round(years * 12));
    const r = inputs.interestRate / 100 / 12;
    const p = Number(inputs.principal) || 0;
    const arr = [];
    if (inputs.interestType === 'emi') {
      const emi = r === 0 ? p / months : p * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
      let balance = p;
      for (let m = 1; m <= months; m++) {
        const interest = balance * r;
        const principalPaid = Math.min(balance, emi - interest);
        balance = Math.max(0, balance - principalPaid);
        if (m % 1 === 0) arr.push({ name: `M${m}`, balance });
      }
    } else {
      for (let m = 1; m <= months; m++) {
        arr.push({ name: `M${m}`, balance: p });
      }
    }
    return arr.filter((_, i) => i % Math.ceil(months / 12) === 0);
  }, [inputs]);

  const pieData = useMemo(() => {
    const years = calcDurationYears(inputs.startDate, inputs.dueDate) || 1;
    const p = Number(inputs.principal) || 0;
    const interestSimple = p * (inputs.interestRate / 100) * years;
    return [
      { name: 'Principal', value: p },
      { name: 'Interest', value: inputs.interestType === 'emi' ? Math.max(0, p > 0 ? (schedulePoints.length > 0 ? (schedulePoints[0].balance - schedulePoints[schedulePoints.length - 1].balance) : 0) : 0) : interestSimple },
    ];
  }, [inputs, schedulePoints]);

  const barData = useMemo(() => partyAgg.map(p => ({ name: p.name, lent: p.lent, borrowed: p.borrowed })), [partyAgg]);

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Loan Ledger</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Add Entry'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Lent</p>
            <h3 className="stat-value">₹{Math.round(totals.lent).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiActivity />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Borrowed</p>
            <h3 className="stat-value">₹{Math.round(totals.borrowed).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Net</p>
            <h3 className="stat-value" style={{ color: totals.net >= 0 ? '#10B981' : '#EF4444' }}>₹{Math.round(totals.net).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
            <FiUsers />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Records</p>
            <h3 className="stat-value">{totals.count}</h3>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="charts-header">
          <h2>Ledger Analytics</h2>
          <p>Party-wise totals and balance projection</p>
        </div>
        <div className="charts-grid">
          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Balance Projection</h3>
              </div>
              <div className="chart-subtitle">Based on current inputs</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={schedulePoints} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="ledgerArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, 'Balance']} />
                  <Area type="monotone" dataKey="balance" stroke="#2563EB" strokeWidth={3} fill="url(#ledgerArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiPieChart className="chart-icon" />
                <h3>Principal vs Interest</h3>
              </div>
              <div className="chart-subtitle">For current inputs</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${Math.round(value).toLocaleString('en-IN')}`, 'Value']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Party Distribution</h3>
              </div>
              <div className="chart-subtitle">Lent vs Borrowed</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, '']} />
                  <Legend />
                  <Bar dataKey="lent" fill="#10B981" name="Lent" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="borrowed" fill="#EF4444" name="Borrowed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="investments-table-card">
        <div className="table-header">
          <h2>Records</h2>
        </div>
        <div className="table-container">
          <table className="investments-table">
            <thead>
              <tr>
                <th>Party</th>
                <th>Type</th>
                <th>Principal</th>
                <th>Rate</th>
                <th>Start</th>
                <th>Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, idx) => (
                <tr key={e._id || idx}>
                  <td>{e.partyName}</td>
                  <td>{e.type}</td>
                  <td>₹{Math.round(e.principal).toLocaleString('en-IN')}</td>
                  <td>{e.interestRate}%</td>
                  <td>{e.startDate}</td>
                  <td>{e.dueDate || '-'}</td>
                  <td>{e.status}</td>
                  <td>
                    <div className="investment-actions">
                      <button onClick={() => handleEdit(idx)} className="btn-icon"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(idx)} className="btn-icon btn-danger"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>Add / Edit Entry</h2>
          <form className="investment-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label>Party Name *</label>
                <input type="text" value={inputs.partyName} onChange={(e) => setInputs({ ...inputs, partyName: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Relation</label>
                <input type="text" value={inputs.relation} onChange={(e) => setInputs({ ...inputs, relation: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Type *</label>
                <select value={inputs.type} onChange={(e) => setInputs({ ...inputs, type: e.target.value })} required>
                  <option>Lent</option>
                  <option>Borrowed</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Principal (₹) *</label>
                <input type="number" value={inputs.principal} onChange={(e) => setInputs({ ...inputs, principal: Number(e.target.value) })} required />
              </div>
              <div className="form-field">
                <label>Interest Rate (%) *</label>
                <input type="number" step="0.01" value={inputs.interestRate} onChange={(e) => setInputs({ ...inputs, interestRate: Number(e.target.value) })} required />
              </div>
              <div className="form-field">
                <label>Interest Type *</label>
                <select value={inputs.interestType} onChange={(e) => setInputs({ ...inputs, interestType: e.target.value })} required>
                  <option>simple</option>
                  <option>emi</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Start Date *</label>
                <input type="date" value={inputs.startDate} onChange={(e) => setInputs({ ...inputs, startDate: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Due Date</label>
                <input type="date" value={inputs.dueDate} onChange={(e) => setInputs({ ...inputs, dueDate: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Frequency</label>
                <select value={inputs.frequency} onChange={(e) => setInputs({ ...inputs, frequency: e.target.value })}>
                  <option>monthly</option>
                  <option>quarterly</option>
                  <option>yearly</option>
                  <option>one-time</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Collateral</label>
                <input type="text" value={inputs.collateral} onChange={(e) => setInputs({ ...inputs, collateral: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={inputs.status} onChange={(e) => setInputs({ ...inputs, status: e.target.value })}>
                  <option>active</option>
                  <option>closed</option>
                  <option>overdue</option>
                </select>
              </div>
              <div className="form-field">
                <label>Notes</label>
                <input type="text" value={inputs.notes} onChange={(e) => setInputs({ ...inputs, notes: e.target.value })} />
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

export default LoanLedger;
