import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBarChart2, FiPieChart, FiCalendar, FiDollarSign, FiClock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { investmentAPI } from '../../../utils/investmentAPI';
import api from '../../../utils/api';
import '../../investments/Investment.css';

const BillChecklist = () => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  const [paidFrom, setPaidFrom] = useState('none'); // none | cash | card | bank
  const [cashLink, setCashLink] = useState({
    type: 'physical-cash',
    location: '',
    walletProvider: '',
    date: new Date().toISOString().slice(0, 10),
    currency: 'INR',
  });
  const [cards, setCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [cardLink, setCardLink] = useState({ cardId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' });
  const [bankLink, setBankLink] = useState({ accountId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' });

  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm]);

  const CATEGORY_KEY = 'daily-bill-checklist';

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
    notes: JSON.stringify({ 
      ...data,
      paidFrom,
      cashLink,
      cardLink,
      bankLink,
    }),
  });

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
      paymentMethod: notes.paymentMethod || 'UPI',
      status: notes.status || 'pending',
      reminderDays: notes.reminderDays || 3,
      notes: notes.notes || '',
      startDate: inv.startDate?.slice(0,10) || notes.startDate || '',
      paidFrom: notes.paidFrom || 'none',
      cashLink: notes.cashLink || undefined,
      cardLink: notes.cardLink || undefined,
      bankLink: notes.bankLink || undefined,
    };
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await investmentAPI.getAll(CATEGORY_KEY);
      const list = (res.data.investments || []).map(fromInvestment);
      setEntries(list);
    } catch (e) {
      console.error('Error fetching bill checklist:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const [cardsRes, bankRes] = await Promise.all([
          api.get('/cards'),
          api.get('/bank'),
        ]);
        setCards(cardsRes.data || []);
        setBankAccounts(bankRes.data || []);
      } catch (e) {
        // silent
      }
    })();
  }, []);

  const totals = useMemo(() => {
    let pending = 0, paid = 0, overdue = 0, upcoming = 0;
    const now = new Date();
    for (const e of entries) {
      const amt = Number(e.amount) || 0;
      if (e.status === 'pending') pending += amt;
      else if (e.status === 'paid') paid += amt;
      else if (e.status === 'overdue') overdue += amt;
      const due = e.dueDate ? new Date(e.dueDate) : null;
      if (due && due >= now) upcoming += amt;
    }
    return { pending, paid, overdue, upcoming, count: entries.length };
  }, [entries]);

  const providerAgg = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = e.provider || e.billType || 'Unknown';
      const prev = map.get(key) || { name: key, amount: 0 };
      prev.amount += Number(e.amount) || 0;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [entries]);

  const statusPie = useMemo(() => {
    const data = [
      { name: 'Pending', value: entries.filter(e => e.status === 'pending').length },
      { name: 'Paid', value: entries.filter(e => e.status === 'paid').length },
      { name: 'Overdue', value: entries.filter(e => e.status === 'overdue').length },
    ];
    return data;
  }, [entries]);

  const COLORS = ['#2563EB', '#10B981', '#EF4444', '#8B5CF6'];

  const upcomingSeries = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()+1}`, name: d.toLocaleString('en-US', { month: 'short' }), total: 0 });
    }
    for (const e of entries) {
      if (!e.dueDate) continue;
      const due = new Date(e.dueDate);
      const key = `${due.getFullYear()}-${due.getMonth()+1}`;
      const slot = months.find(m => m.key === key);
      if (slot) slot.total += Number(e.amount) || 0;
    }
    return months.map(m => ({ name: m.name, value: m.total }));
  }, [entries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await investmentAPI.update(editingId, toPayload(inputs));
      } else {
        await investmentAPI.create(toPayload(inputs));
      }

      // Link payment into Cash/Cards/Bank if marked paid
      if (inputs.status === 'paid') {
        const amount = Number(inputs.amount) || 0;
        const todayStr = new Date().toISOString().slice(0,10);
        const payDate = inputs.startDate || todayStr;
        const mapBillTypeToCategory = (billType) => {
          const t = (billType || '').toLowerCase();
          if (['electricity','water','gas','internet','mobile','maintenance'].some(k => t.includes(k))) return 'utilities';
          if (t.includes('school')) return 'education';
          if (t.includes('rent')) return 'rent';
          if (t.includes('insurance')) return 'other';
          return 'other';
        };
        const categoryMapped = mapBillTypeToCategory(inputs.billType);
        if (paidFrom === 'cash') {
          const payload = {
            type: cashLink.type,
            name: `Bill Payment - ${inputs.billType}`,
            currency: cashLink.currency || 'INR',
            amount,
            date: cashLink.date || payDate,
            location: cashLink.type === 'physical-cash' ? (cashLink.location || 'Wallet') : undefined,
            walletProvider: cashLink.type === 'digital-wallet' ? (cashLink.walletProvider || 'Wallet') : undefined,
            walletType: 'prepaid',
            description: `${inputs.provider} (${inputs.accountNumber || ''})`,
            notes: `Auto-linked from Bill Checklist`,
          };
          await api.post('/cash', payload);
        } else if (paidFrom === 'card' && cardLink.cardId) {
          const payload = {
            cardId: cardLink.cardId,
            type: 'payment',
            amount,
            merchant: inputs.provider || inputs.billType,
            category: categoryMapped,
            description: `Bill Payment - ${inputs.billType}`,
            date: cardLink.date || payDate,
            currency: cardLink.currency || 'INR',
          };
          await api.post('/transactions', payload);
        } else if (paidFrom === 'bank' && bankLink.accountId) {
          const payload = {
            accountId: bankLink.accountId,
            type: 'payment',
            amount,
            merchant: inputs.provider || inputs.billType,
            category: categoryMapped,
            description: `Bill Payment - ${inputs.billType}`,
            date: bankLink.date || payDate,
            currency: bankLink.currency || 'INR',
          };
          await api.post('/bank-transactions', payload);
        }
      }
      await fetchEntries();
      setEditingId(null);
      setInputs({ billType: 'Electricity', provider: '', accountNumber: '', cycle: 'monthly', amount: 1000, dueDate: '', autoDebit: false, paymentMethod: 'UPI', status: 'pending', reminderDays: 3, notes: '', startDate: new Date().toISOString().slice(0,10) });
      setPaidFrom('none');
      setCardLink({ cardId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' });
      setBankLink({ accountId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' });
      setCashLink({ type: 'physical-cash', location: '', walletProvider: '', date: new Date().toISOString().slice(0,10), currency: 'INR' });
      setShowForm(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving bill');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (index) => {
    const item = entries[index];
    setInputs({
      billType: item.billType || 'Bill',
      provider: item.provider || '',
      accountNumber: item.accountNumber || '',
      cycle: item.cycle || 'monthly',
      amount: item.amount || 0,
      dueDate: item.dueDate || '',
      autoDebit: !!item.autoDebit,
      paymentMethod: item.paymentMethod || 'UPI',
      status: item.status || 'pending',
      reminderDays: item.reminderDays || 3,
      notes: item.notes || '',
      startDate: item.startDate || new Date().toISOString().slice(0,10),
    });
    setPaidFrom(item.paidFrom || 'none');
    if (item.cashLink) setCashLink({ ...cashLink, ...item.cashLink });
    if (item.cardLink) setCardLink({ ...cardLink, ...item.cardLink });
    if (item.bankLink) setBankLink({ ...bankLink, ...item.bankLink });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    const item = entries[index];
    if (window.confirm('Delete this bill?')) {
      try {
        await investmentAPI.delete(item._id);
        await fetchEntries();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting bill');
      }
    }
  };

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Bill Paying Checklist</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Add Bill'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending Amount</p>
            <h3 className="stat-value">₹{Math.round(totals.pending).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <p className="stat-label">Paid Amount</p>
            <h3 className="stat-value">₹{Math.round(totals.paid).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiAlertTriangle />
          </div>
          <div className="stat-content">
            <p className="stat-label">Overdue</p>
            <h3 className="stat-value">₹{Math.round(totals.overdue).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
            <FiCalendar />
          </div>
          <div className="stat-content">
            <p className="stat-label">Upcoming Dues</p>
            <h3 className="stat-value">₹{Math.round(totals.upcoming).toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="charts-header">
          <h2>Bill Analytics</h2>
          <p>Status distribution, provider totals, and upcoming dues</p>
        </div>
        <div className="charts-grid">
          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiPieChart className="chart-icon" />
                <h3>Status Distribution</h3>
              </div>
              <div className="chart-subtitle">Pending vs Paid vs Overdue</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {statusPie.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Provider Totals</h3>
              </div>
              <div className="chart-subtitle">Amount per provider</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={providerAgg} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [`₹${Math.round(value).toLocaleString('en-IN')}`, 'Amount']} />
                  <Legend />
                  <Bar dataKey="amount" fill="#2563EB" name="Amount" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiClock className="chart-icon" />
                <h3>Upcoming Dues</h3>
              </div>
              <div className="chart-subtitle">Next 12 months total</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={upcomingSeries} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="billArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, 'Total']} />
                  <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fill="url(#billArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="investments-table-card">
        <div className="table-header">
          <h2>Bills</h2>
        </div>
        <div className="table-container">
          <table className="investments-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Provider</th>
                <th>Account</th>
                <th>Cycle</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Auto-Debit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, idx) => (
                <tr key={e._id || idx}>
                  <td>{e.billType}</td>
                  <td>{e.provider}</td>
                  <td>{e.accountNumber || '-'}</td>
                  <td>{e.cycle}</td>
                  <td>₹{Math.round(e.amount).toLocaleString('en-IN')}</td>
                  <td>{e.dueDate || '-'}</td>
                  <td>{e.status}</td>
                  <td>{e.autoDebit ? 'Yes' : 'No'}</td>
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
          <h2>Add / Edit Bill</h2>
          <form className="investment-form" onSubmit={handleSubmit}>
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

            <div className="form-row">
              <div className="form-field">
                <label>Payment Method</label>
                <select value={inputs.paymentMethod} onChange={(e) => setInputs({ ...inputs, paymentMethod: e.target.value })}>
                  <option>UPI</option>
                  <option>NetBanking</option>
                  <option>Card</option>
                  <option>Cash</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={inputs.status} onChange={(e) => setInputs({ ...inputs, status: e.target.value })}>
                  <option>pending</option>
                  <option>paid</option>
                  <option>overdue</option>
                </select>
              </div>
              <div className="form-field">
                <label>Paid From</label>
                <select value={paidFrom} onChange={(e) => setPaidFrom(e.target.value)}>
                  <option value="none">None</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
              <div className="form-field">
                <label>Auto-Debit</label>
                <select value={inputs.autoDebit ? 'Yes' : 'No'} onChange={(e) => setInputs({ ...inputs, autoDebit: e.target.value === 'Yes' })}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>

            {paidFrom === 'cash' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Cash Type</label>
                  <select value={cashLink.type} onChange={(e) => setCashLink({ ...cashLink, type: e.target.value })}>
                    <option value="physical-cash">Physical Cash</option>
                    <option value="digital-wallet">Digital Wallet</option>
                  </select>
                </div>
                {cashLink.type === 'physical-cash' ? (
                  <div className="form-field">
                    <label>Location</label>
                    <input type="text" value={cashLink.location} onChange={(e) => setCashLink({ ...cashLink, location: e.target.value })} placeholder="e.g., Wallet" />
                  </div>
                ) : (
                  <div className="form-field">
                    <label>Wallet Provider</label>
                    <input type="text" value={cashLink.walletProvider} onChange={(e) => setCashLink({ ...cashLink, walletProvider: e.target.value })} placeholder="e.g., Paytm" />
                  </div>
                )}
                <div className="form-field">
                  <label>Payment Date</label>
                  <input type="date" value={cashLink.date} onChange={(e) => setCashLink({ ...cashLink, date: e.target.value })} />
                </div>
              </div>
            )}

            {paidFrom === 'card' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Select Card</label>
                  <select value={cardLink.cardId} onChange={(e) => setCardLink({ ...cardLink, cardId: e.target.value })}>
                    <option value="">Choose card...</option>
                    {cards.map(c => (
                      <option key={c._id} value={c._id}>{c.name} - {c.issuer}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Payment Date</label>
                  <input type="date" value={cardLink.date} onChange={(e) => setCardLink({ ...cardLink, date: e.target.value })} />
                </div>
              </div>
            )}

            {paidFrom === 'bank' && (
              <div className="form-row">
                <div className="form-field">
                  <label>Select Account</label>
                  <select value={bankLink.accountId} onChange={(e) => setBankLink({ ...bankLink, accountId: e.target.value })}>
                    <option value="">Choose account...</option>
                    {bankAccounts.map(b => (
                      <option key={b._id} value={b._id}>{b.name} - {b.bankName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Payment Date</label>
                  <input type="date" value={bankLink.date} onChange={(e) => setBankLink({ ...bankLink, date: e.target.value })} />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-field">
                <label>Reminder (days before)</label>
                <input type="number" value={inputs.reminderDays} onChange={(e) => setInputs({ ...inputs, reminderDays: Number(e.target.value) })} />
              </div>
              <div className="form-field">
                <label>Start Date</label>
                <input type="date" value={inputs.startDate} onChange={(e) => setInputs({ ...inputs, startDate: e.target.value })} />
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

export default BillChecklist;
