import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBarChart2, FiPieChart, FiPhoneCall, FiClock, FiUser, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { investmentAPI } from '../../../utils/investmentAPI';
import '../../investments/Investment.css';

const TelephoneConversation = () => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [inputs, setInputs] = useState({
    contactName: '',
    phoneNumber: '',
    callType: 'Outgoing',
    dateTime: new Date().toISOString().slice(0,16),
    durationMinutes: 5,
    topic: '',
    summary: '',
    actionItems: [''],
    status: 'open',
    priority: 'medium',
    followUpDate: '',
    tags: '',
    notes: '',
    // Ticket Information fields
    ticketNumber: '',
    ticketPriority: 'Medium',
    resolutionStatus: 'Pending',
    avgResponseTime: '',
    lastContactDate: '',
    issueDescription: '',
  });

  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm]);

  const CATEGORY_KEY = 'daily-telephone-conversation';

  const toPayload = (data) => ({
    category: CATEGORY_KEY,
    type: 'Call',
    name: `${data.callType} - ${data.contactName || 'Unknown'}`,
    provider: data.phoneNumber || data.contactName || 'Contact',
    amount: 0,
    startDate: (data.dateTime ? new Date(data.dateTime) : new Date()).toISOString().slice(0, 10),
    maturityDate: data.followUpDate || undefined,
    frequency: 'one-time',
    notes: JSON.stringify({ ...data }),
  });

  const fromInvestment = (inv) => {
    let notes = {};
    try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
    return {
      _id: inv._id,
      contactName: notes.contactName || '',
      phoneNumber: inv.provider || notes.phoneNumber || '',
      callType: notes.callType || 'Outgoing',
      dateTime: notes.dateTime || (inv.startDate ? new Date(inv.startDate).toISOString().slice(0,16) : ''),
      durationMinutes: notes.durationMinutes || 0,
      topic: notes.topic || '',
      summary: notes.summary || '',
      actionItems: Array.isArray(notes.actionItems) ? notes.actionItems : (notes.actionItems ? [notes.actionItems] : []),
      status: notes.status || 'open',
      priority: notes.priority || 'medium',
      followUpDate: inv.maturityDate?.slice(0,10) || notes.followUpDate || '',
      tags: notes.tags || '',
      notes: notes.notes || '',
      // Ticket Information fields
      ticketNumber: notes.ticketNumber || '',
      ticketPriority: notes.ticketPriority || 'Medium',
      resolutionStatus: notes.resolutionStatus || 'Pending',
      avgResponseTime: notes.avgResponseTime || '',
      lastContactDate: notes.lastContactDate || '',
      issueDescription: notes.issueDescription || '',
    };
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await investmentAPI.getAll(CATEGORY_KEY);
      const list = (res.data.investments || []).map(fromInvestment);
      setEntries(list);
    } catch (e) {
      console.error('Error fetching calls:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const totals = useMemo(() => {
    const open = entries.filter(e => e.status === 'open').length;
    const closed = entries.filter(e => e.status === 'closed').length;
    const outgoing = entries.filter(e => e.callType === 'Outgoing').length;
    const incoming = entries.filter(e => e.callType === 'Incoming').length;
    return { open, closed, outgoing, incoming, count: entries.length };
  }, [entries]);

  const statusPie = useMemo(() => ([
    { name: 'Open', value: entries.filter(e => e.status === 'open').length },
    { name: 'Closed', value: entries.filter(e => e.status === 'closed').length },
  ]), [entries]);

  const contactAgg = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = e.contactName || e.phoneNumber || 'Unknown';
      const prev = map.get(key) || { name: key, calls: 0 };
      prev.calls += 1;
      map.set(key, prev);
    }
    return Array.from(map.values()).sort((a, b) => b.calls - a.calls).slice(0, 10);
  }, [entries]);

  const timeline = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const d = e.dateTime ? e.dateTime.slice(0,10) : (e.followUpDate || '');
      if (!d) continue;
      const prev = map.get(d) || { name: d, count: 0 };
      prev.count += 1;
      map.set(d, prev);
    }
    return Array.from(map.values()).sort((a, b) => (a.name > b.name ? 1 : -1)).slice(-30);
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
        contactName: '', phoneNumber: '', callType: 'Outgoing', dateTime: new Date().toISOString().slice(0,16), durationMinutes: 5, topic: '', summary: '', actionItems: [''], status: 'open', priority: 'medium', followUpDate: '', tags: '', notes: '', ticketNumber: '', ticketPriority: 'Medium', resolutionStatus: 'Pending', avgResponseTime: '', lastContactDate: '', issueDescription: ''
      });
      setShowForm(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving call');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (index) => {
    const item = entries[index];
    setInputs({
      contactName: item.contactName || '',
      phoneNumber: item.phoneNumber || '',
      callType: item.callType || 'Outgoing',
      dateTime: item.dateTime || new Date().toISOString().slice(0,16),
      durationMinutes: item.durationMinutes || 0,
      topic: item.topic || '',
      summary: item.summary || '',
      actionItems: item.actionItems?.length ? item.actionItems : [''],
      status: item.status || 'open',
      priority: item.priority || 'medium',
      followUpDate: item.followUpDate || '',
      tags: item.tags || '',
      notes: item.notes || '',
      // Ticket Information fields
      ticketNumber: item.ticketNumber || '',
      ticketPriority: item.ticketPriority || 'Medium',
      resolutionStatus: item.resolutionStatus || 'Pending',
      avgResponseTime: item.avgResponseTime || '',
      lastContactDate: item.lastContactDate || '',
      issueDescription: item.issueDescription || '',
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    const item = entries[index];
    if (window.confirm('Delete this call?')) {
      try {
        await investmentAPI.delete(item._id);
        await fetchEntries();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting call');
      }
    }
  };

  const updateActionItem = (idx, value) => {
    const list = [...inputs.actionItems];
    list[idx] = value;
    setInputs({ ...inputs, actionItems: list });
  };

  const addActionItem = () => setInputs({ ...inputs, actionItems: [...inputs.actionItems, ''] });
  const removeActionItem = (idx) => setInputs({ ...inputs, actionItems: inputs.actionItems.filter((_, i) => i !== idx) });

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
        <h1>Telephone Conversation</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Add Call'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiPhoneCall />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Calls</p>
            <h3 className="stat-value">{totals.count}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <p className="stat-label">Closed</p>
            <h3 className="stat-value">{totals.closed}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiAlertTriangle />
          </div>
          <div className="stat-content">
            <p className="stat-label">Open</p>
            <h3 className="stat-value">{totals.open}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
            <FiUser />
          </div>
          <div className="stat-content">
            <p className="stat-label">Outgoing/Incoming</p>
            <h3 className="stat-value">{totals.outgoing}/{totals.incoming}</h3>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="charts-header">
          <h2>Call Analytics</h2>
          <p>Status distribution, trending by date, and top contacts</p>
        </div>
        <div className="charts-grid">
          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiPieChart className="chart-icon" />
                <h3>Status</h3>
              </div>
              <div className="chart-subtitle">Open vs Closed</div>
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
                <FiClock className="chart-icon" />
                <h3>Last 30 Days</h3>
              </div>
              <div className="chart-subtitle">Calls per day</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={timeline} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="callArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <Tooltip formatter={(v) => [v, 'Calls']} />
                  <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} fill="url(#callArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Top Contacts</h3>
              </div>
              <div className="chart-subtitle">Most interactions</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={contactAgg} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <Tooltip formatter={(v) => [v, 'Calls']} />
                  <Legend />
                  <Bar dataKey="calls" fill="#8B5CF6" name="Calls" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="investments-table-card">
        <div className="table-header">
          <h2>Calls</h2>
        </div>
        <div className="table-container">
          <table className="investments-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Date/Time</th>
                <th>Duration (min)</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, idx) => (
                <tr key={e._id || idx}>
                  <td>{e.contactName || '-'}</td>
                  <td>{e.phoneNumber || '-'}</td>
                  <td>{e.callType}</td>
                  <td>{e.dateTime?.replace('T', ' ') || '-'}</td>
                  <td>{e.durationMinutes || 0}</td>
                  <td>{e.status}</td>
                  <td>{e.priority}</td>
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
          <h2>Add / Edit Call</h2>
          <form className="investment-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label>Contact Name *</label>
                <input type="text" value={inputs.contactName} onChange={(e) => setInputs({ ...inputs, contactName: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Phone Number *</label>
                <input type="tel" value={inputs.phoneNumber} onChange={(e) => setInputs({ ...inputs, phoneNumber: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Call Type *</label>
                <select value={inputs.callType} onChange={(e) => setInputs({ ...inputs, callType: e.target.value })} required>
                  <option>Outgoing</option>
                  <option>Incoming</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Date & Time *</label>
                <input type="datetime-local" value={inputs.dateTime} onChange={(e) => setInputs({ ...inputs, dateTime: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Duration (minutes)</label>
                <input type="number" value={inputs.durationMinutes} onChange={(e) => setInputs({ ...inputs, durationMinutes: Number(e.target.value) })} />
              </div>
              <div className="form-field">
                <label>Priority</label>
                <select value={inputs.priority} onChange={(e) => setInputs({ ...inputs, priority: e.target.value })}>
                  <option>low</option>
                  <option>medium</option>
                  <option>high</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Topic</label>
                <input type="text" value={inputs.topic} onChange={(e) => setInputs({ ...inputs, topic: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Follow-up Date</label>
                <input type="date" value={inputs.followUpDate} onChange={(e) => setInputs({ ...inputs, followUpDate: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={inputs.status} onChange={(e) => setInputs({ ...inputs, status: e.target.value })}>
                  <option>open</option>
                  <option>closed</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Tags</label>
                <input type="text" value={inputs.tags} onChange={(e) => setInputs({ ...inputs, tags: e.target.value })} placeholder="comma separated" />
              </div>
              <div className="form-field">
                <label>Notes</label>
                <input type="text" value={inputs.notes} onChange={(e) => setInputs({ ...inputs, notes: e.target.value })} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field full">
                <label>Action Items</label>
                {inputs.actionItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input type="text" value={item} onChange={(e) => updateActionItem(idx, e.target.value)} />
                    <button type="button" className="btn-danger" onClick={() => removeActionItem(idx)} disabled={inputs.actionItems.length === 1}>Remove</button>
                  </div>
                ))}
                <button type="button" className="btn-primary" onClick={addActionItem}><FiPlus /> Add Item</button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field full">
                <label>Summary</label>
                <textarea value={inputs.summary} onChange={(e) => setInputs({ ...inputs, summary: e.target.value })} placeholder="Call summary..." rows="3" />
              </div>
            </div>

            {/* Ticket Information Section */}
            <div className="form-section">
              <h4>Ticket Information</h4>
              <div className="form-row">
                <div className="form-field">
                  <label>Ticket Number (if any)</label>
                  <input
                    type="text"
                    value={inputs.ticketNumber}
                    onChange={(e) => setInputs({ ...inputs, ticketNumber: e.target.value })}
                    placeholder="e.g., TK-12345"
                  />
                </div>
                <div className="form-field">
                  <label>Priority</label>
                  <select
                    value={inputs.ticketPriority}
                    onChange={(e) => setInputs({ ...inputs, ticketPriority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Resolution Status</label>
                  <select
                    value={inputs.resolutionStatus}
                    onChange={(e) => setInputs({ ...inputs, resolutionStatus: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Average Response Time</label>
                  <input
                    type="text"
                    value={inputs.avgResponseTime}
                    onChange={(e) => setInputs({ ...inputs, avgResponseTime: e.target.value })}
                    placeholder="e.g., 24 hours, 2 business days"
                  />
                </div>
                <div className="form-field">
                  <label>Last Contact Date</label>
                  <input
                    type="date"
                    value={inputs.lastContactDate}
                    onChange={(e) => setInputs({ ...inputs, lastContactDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field full">
                  <label>Issue Description</label>
                  <textarea
                    value={inputs.issueDescription}
                    onChange={(e) => setInputs({ ...inputs, issueDescription: e.target.value })}
                    placeholder="Describe the issue or reason for contact..."
                    rows={4}
                  />
                </div>
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

export default TelephoneConversation;
