import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBarChart2, FiPieChart, FiDollarSign, FiTrendingUp, FiActivity, FiFolder } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { investmentAPI } from '../../utils/investmentAPI';
import './Investment.css';

const ProjectIncomeExpense = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    category: 'project-wise',
    type: 'Income', // Income or Expense
    name: '', // Project name
    provider: '', // Developer
    amount: '',
    startDate: '',
    frequency: 'one-time',
    notes: '',
  });

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await investmentAPI.getAll('project-wise');
      setEntries(response.data.investments || []);
    } catch (error) {
      console.error('Error fetching project entries:', error);
      setEntries([
        {
          _id: 'demo-1',
          category: 'project-wise',
          type: 'Income',
          name: 'Project Alpha',
          provider: 'Dev A',
          amount: 120000,
          startDate: '2025-01-10',
          frequency: 'monthly',
          notes: 'Retainer payment'
        },
        {
          _id: 'demo-2',
          category: 'project-wise',
          type: 'Expense',
          name: 'Project Alpha',
          provider: 'Dev X',
          amount: 45000,
          startDate: '2025-01-15',
          frequency: 'one-time',
          notes: 'Equipment purchase'
        },
        {
          _id: 'demo-3',
          category: 'project-wise',
          type: 'Expense',
          name: 'Project Beta',
          provider: 'Dev Y',
          amount: 30000,
          startDate: '2025-01-20',
          frequency: 'monthly',
          notes: 'Subcontracting'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        category: 'project-wise',
        type: formData.type,
        name: formData.name,
        provider: formData.provider,
        amount: parseFloat(formData.amount) || 0,
        startDate: formData.startDate,
        frequency: formData.frequency,
        notes: formData.notes || '',
      };
      if (editingId) {
        await investmentAPI.update(editingId, dataToSend);
      } else {
        await investmentAPI.create(dataToSend);
      }
      resetForm();
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert(error.response?.data?.message || 'Error saving entry');
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      category: entry.category,
      type: entry.type,
      name: entry.name,
      provider: entry.provider || '',
      amount: entry.amount || '',
      startDate: entry.startDate?.split('T')[0] || '',
      frequency: entry.frequency || 'one-time',
      notes: entry.notes || '',
    });
    setEditingId(entry._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await investmentAPI.delete(id);
        fetchEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Error deleting entry');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'project-wise',
      type: 'Income',
      name: '',
      provider: '',
      amount: '',
      startDate: '',
      frequency: 'one-time',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const totals = useMemo(() => {
    const income = entries.filter(e => e.type === 'Income').reduce((s, e) => s + (e.amount || 0), 0);
    const expense = entries.filter(e => e.type === 'Expense').reduce((s, e) => s + (e.amount || 0), 0);
    const net = income - expense;
    const expensePercent = income > 0 ? ((expense / income) * 100).toFixed(2) : 0;
    return { income, expense, net, expensePercent };
  }, [entries]);

  const projectAgg = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = e.name || 'Unnamed Project';
      const prev = map.get(key) || { name: key, income: 0, expense: 0, net: 0, count: 0 };
      if (e.type === 'Income') prev.income += e.amount || 0; else prev.expense += e.amount || 0;
      prev.net = prev.income - prev.expense;
      prev.count += 1;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [entries]);

  const providerAgg = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = e.provider || 'Unknown';
      const prev = map.get(key) || { name: key, value: 0 };
      prev.value += e.amount || 0;
      map.set(key, prev);
    }
    return Array.from(map.values());
  }, [entries]);

  const pieData = useMemo(() => ([
    { name: 'Income', value: totals.income },
    { name: 'Expense', value: totals.expense },
  ]), [totals]);

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Project Wise Income / Expense</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Add Record'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Income</p>
            <h3 className="stat-value">₹{totals.income.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiActivity />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Expense</p>
            <h3 className="stat-value">₹{totals.expense.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Net</p>
            <h3 className="stat-value" style={{ color: totals.net >= 0 ? '#10B981' : '#EF4444' }}>₹{totals.net.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' }}>
            <FiFolder />
          </div>
          <div className="stat-content">
            <p className="stat-label">Projects</p>
            <h3 className="stat-value">{projectAgg.length}</h3>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="charts-section">
          <div className="charts-header">
            <h2>Project Analytics</h2>
            <p>Income vs Expense and project-wise distribution</p>
          </div>

          <div className="charts-grid">
            <div className="chart-card premium">
              <div className="chart-header">
                <div className="chart-title">
                  <FiPieChart className="chart-icon" />
                  <h3>Income vs Expense</h3>
                </div>
                <div className="chart-subtitle">Share of totals</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, idx) => (
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
                  <h3>Project Performance</h3>
                </div>
                <div className="chart-subtitle">Income vs Expense by project</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={projectAgg} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']} />
                    <Legend />
                    <Bar dataKey="income" fill="#2563EB" name="Income" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expense" fill="#EF4444" name="Expense" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card premium full-width">
              <div className="chart-header">
            <div className="chart-title">
                  <FiActivity className="chart-icon" />
                  <h3>Developer Distribution</h3>
                </div>
                <div className="chart-subtitle">Totals by developer</div>
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
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Total']} />
                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fill="url(#areaGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="table-container">
          <h2>Entries</h2>
          <table className="investments-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Project</th>
                <th>Developer</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e._id}>
                  <td>
                    <span className="investment-type-badge" style={{ 
                      background: e.type === 'Income' ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                    }}>
                      {e.type}
                    </span>
                  </td>
                  <td>{e.name}</td>
                  <td>{e.provider || '—'}</td>
                  <td>₹{(e.amount || 0).toLocaleString('en-IN')}</td>
                  <td>{e.frequency || 'one-time'}</td>
                  <td>{new Date(e.startDate).toLocaleDateString('en-IN')}</td>
                  <td>{e.notes || '—'}</td>
                  <td>
                    <div className="investment-actions">
                      <button onClick={() => handleEdit(e)} className="btn-icon">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(e._id)} className="btn-icon btn-danger">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entries.length === 0 && !loading && (
        <div className="empty-state">
          <p>No project records found. Add your first entry to get started!</p>
        </div>
      )}

      {showForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>{editingId ? 'Edit Record' : 'Add New Record'}</h2>
          <form onSubmit={handleSubmit} className="investment-form">
            <div className="form-row">
              <div className="form-field">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div className="form-field">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Project Alpha"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Developer</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g., Dev A"
                />
              </div>

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
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Frequency *</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  required
                >
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
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

export default ProjectIncomeExpense;
