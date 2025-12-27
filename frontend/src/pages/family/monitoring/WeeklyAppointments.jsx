import { useEffect, useState } from 'react';
import { FiBarChart2, FiPieChart, FiCalendar, FiUsers, FiPlus } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { investmentAPI } from '../../../utils/investmentAPI';
import '../../investments/Investment.css';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const WeeklyAppointments = () => {
  const [loading, setLoading] = useState(false);
  const [weekdayCounts, setWeekdayCounts] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [schedule, setSchedule] = useState({ days: [], slots: [], stepMin: 30, weekStart: '', weekEnd: '' });
  const [summary, setSummary] = useState({ total: 0, open: 0, closed: 0, weekStart: '', weekEnd: '' });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inputs, setInputs] = useState({
    contactName: '',
    phoneNumber: '',
    callType: 'Outgoing',
    dateTime: new Date().toISOString().slice(0,16),
    status: 'open',
    priority: 'medium',
    followUpDate: '',
    notes: '',
  });
  const [selectedWeekStart, setSelectedWeekStart] = useState('');

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const res = await investmentAPI.getWeeklyAppointments(params);
      const data = res.data || {};
      setWeekdayCounts(data.weekdayCounts || []);
      setStatusDistribution(data.statusDistribution || []);
      setUpcoming(data.upcoming || []);
      setSchedule(data.schedule || { days: [], slots: [], stepMin: 30, weekStart: data.summary?.weekStart, weekEnd: data.summary?.weekEnd });
      setSummary(data.summary || { total: 0, open: 0, closed: 0 });
      const ws = (params.weekStart || data.summary?.weekStart || '').slice(0,10);
      if (ws) setSelectedWeekStart(ws);
    } catch (e) {
      console.error('Error fetching weekly appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    trackFeatureUsage('/family/monitoring/weekly-appointments', 'view'); fetchData(); }, []);

  const buildSchedule = (weekISO, startHour = 8, endHour = 20, stepMin = 30) => {
    const base = new Date(weekISO || new Date().toISOString().slice(0,10));
    base.setHours(0,0,0,0);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const label = `${d.getMonth()+1}/${d.getDate()}`;
      const name = d.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
      return { date: d.toISOString(), label, name };
    });
    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += stepMin) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const time = `${hh}:${mm}`;
        slots.push({ time, cells: Array.from({ length: 7 }, () => []) });
      }
    }
    return { days, slots, stepMin, weekStart: base.toISOString(), weekEnd: (() => { const e = new Date(base); e.setDate(base.getDate()+6); e.setHours(23,59,59,999); return e.toISOString(); })() };
  };

  const handleWeekInput = (value) => {
    if (!value) return;
    setSelectedWeekStart(value);
    fetchData({ weekStart: value });
  };
  const shiftWeek = (dir) => {
    const base = selectedWeekStart || (summary.weekStart ? new Date(summary.weekStart).toISOString().slice(0,10) : new Date().toISOString().slice(0,10));
    const d = new Date(base);
    d.setDate(d.getDate() + dir * 7);
    const next = d.toISOString().slice(0,10);
    setSelectedWeekStart(next);
    fetchData({ weekStart: next });
  };

  const COLORS = ['#2563EB', '#10B981', '#EF4444', '#8B5CF6'];
  const weekRange = (() => {
    if (!summary.weekStart || !summary.weekEnd) return '';
    try {
      const start = new Date(summary.weekStart);
      const end = new Date(summary.weekEnd);
      const s = start.toISOString().slice(0,10);
      const e = end.toISOString().slice(0,10);
      return `${s} → ${e}`;
    } catch { return ''; }
  })();

  const weekOfLabel = (() => {
    if (!summary.weekStart) return '';
    const d = new Date(summary.weekStart);
    const monthName = d.toLocaleString('en-US', { month: 'long' });
    return `${monthName} ${d.getDate()}`;
  })();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await investmentAPI.create(toPayload(inputs));
      await fetchData();
      setInputs({ contactName: '', phoneNumber: '', callType: 'Outgoing', dateTime: new Date().toISOString().slice(0,16), status: 'open', priority: 'medium', followUpDate: '', notes: '' });
      setShowForm(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving appointment');
    } finally {
      setSaving(false);
    }
  };

  if (loading && weekdayCounts.length === 0) {
    return (
      <div className="investment-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const chipColors = (type) => {
    switch (type) {
      case 'Incoming':
        return { bg: 'rgba(99, 102, 241, 0.15)', fg: '#3730A3' };
      case 'Outgoing':
        return { bg: 'rgba(16, 185, 129, 0.15)', fg: '#0F766E' };
      case 'Bill':
        return { bg: 'rgba(245, 158, 11, 0.15)', fg: '#B45309' };
      case 'Reminder':
        return { bg: 'rgba(14, 165, 233, 0.15)', fg: '#075985' };
      case 'Notification':
        return { bg: 'rgba(239, 68, 68, 0.15)', fg: '#991B1B' };
      case 'Event':
        return { bg: 'rgba(107, 114, 128, 0.15)', fg: '#374151' };
      case 'Loan':
        return { bg: 'rgba(20, 184, 166, 0.15)', fg: '#0F766E' };
      default:
        return { bg: 'rgba(99, 102, 241, 0.12)', fg: '#3730A3' };
    }
  };

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Weekly Appointment Chart</h1>
        <div className="header-actions" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
            <FiPlus style={{ color: 'white' }} /> {showForm ? 'Cancel' : 'Add Appointment'}
          </button>
          <span style={{ color: '#64748b' }}>{weekRange}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn-primary" onClick={() => shiftWeek(-1)} style={{ padding: '8px 12px' }}>◀</button>
            <input type="date" value={selectedWeekStart || (summary.weekStart ? new Date(summary.weekStart).toISOString().slice(0,10) : '')} onChange={(e) => handleWeekInput(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <button className="btn-primary" onClick={() => shiftWeek(1)} style={{ padding: '8px 12px' }}>▶</button>
          </div>
        </div>
      </div>

      <div className="investments-table-card" style={{ marginTop: 16 }}>
        <div className="table-header" style={{ background: '#0ea5e9', color: 'white', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: 'white', margin: 0 }}>Week of: {weekOfLabel}</h2>
            <span style={{ opacity: 0.9 }}>Set the starting date; days auto-update</span>
          </div>
        </div>
          <div className="table-container weekly-grid" style={{ overflowX: 'auto', overflowY: 'visible', paddingBottom: 8 }}>
            <table className="investments-table" style={{ width: 'max-content', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 120 }}>Time</th>
                  {(schedule.days && schedule.days.length ? schedule.days : buildSchedule(selectedWeekStart || summary.weekStart).days).map((d, i) => (
                    <th key={`day-${i}`} style={{ minWidth: 140 }}>
                      <div style={{ fontWeight: 700 }}>{d.label}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{d.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(schedule.slots && schedule.slots.length ? schedule.slots : buildSchedule(selectedWeekStart || summary.weekStart).slots).map((slot, rIdx) => (
                  <tr key={`row-${rIdx}`}>
                    <td style={{ fontWeight: 600, background: '#f8fafc', position: 'sticky', left: 0 }}>{formatTime(slot.time)}</td>
                    {slot.cells.map((cell, cIdx) => (
                      <td key={`cell-${rIdx}-${cIdx}`} style={{ verticalAlign: 'top', padding: 6, background: (rIdx % 2 ? '#f9fafb' : '#fff') }}>
                      {cell.slice(0, 3).map((ev, j) => (
                        <div key={`ev-${j}`} style={{
                          display: 'inline-block',
                          marginRight: 6,
                          marginBottom: 4,
                          padding: '2px 6px',
                          borderRadius: 8,
                          fontSize: 11,
                          background: chipColors(ev.type).bg,
                          color: chipColors(ev.type).fg,
                          border: '1px dashed #e5e7eb'
                        }}>
                          {ev.type}: {ev.title}
                        </div>
                      ))}
                      {cell.length > 3 ? <div style={{ fontSize: 11, color: '#64748b' }}>+{cell.length - 3} more</div> : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiUsers />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total</p>
            <h3 className="stat-value">{summary.total}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiCalendar />
          </div>
          <div className="stat-content">
            <p className="stat-label">Open/Closed</p>
            <h3 className="stat-value">{summary.open}/{summary.closed}</h3>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="investment-form-card">
          <h2>Add Appointment</h2>
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
                <label>Follow-up Date</label>
                <input type="date" value={inputs.followUpDate} onChange={(e) => setInputs({ ...inputs, followUpDate: e.target.value })} />
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
                <label>Status</label>
                <select value={inputs.status} onChange={(e) => setInputs({ ...inputs, status: e.target.value })}>
                  <option>open</option>
                  <option>closed</option>
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

      <div className="charts-section">
        <div className="charts-header">
          <h2>Week Overview</h2>
          <p>Day-wise counts and status distribution</p>
        </div>
        <div className="charts-grid">
          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Appointments per Day</h3>
              </div>
              <div className="chart-subtitle">Mon → Sun</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={weekdayCounts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                <FiPieChart className="chart-icon" />
                <h3>Status Mix</h3>
              </div>
              <div className="chart-subtitle">Open vs Closed</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {statusDistribution.map((entry, idx) => (
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
          <h2>Week Appointments</h2>
        </div>
        <div className="table-container">
          <table className="investments-table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((u, idx) => (
                <tr key={idx}>
                  <td>{u.date}</td>
                  <td>{u.contactName}</td>
                  <td>{u.callType}</td>
                  <td>{u.status}</td>
                  <td>{u.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const formatTime = (t) => {
  const [hh, mm] = t.split(':');
  let h = parseInt(hh, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12; else if (h > 12) h -= 12;
  return `${h}:${mm} ${ampm}`;
};

export default WeeklyAppointments;
