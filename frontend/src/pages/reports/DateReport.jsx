import { useState, useEffect } from 'react';
import '../reports/Reports.css';
import api from '../../utils/api';
const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function DateReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overdue');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/reports/date');
        if (res.data && res.data.success) setData(res.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="report-page">
      <div className="report-header">
        <h1 className="report-title">📅 Date — Calendar & Bill Tracker</h1>
        <p className="report-subtitle">Missed bills, upcoming EMIs, calendar events, and pending reminders</p>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Loading schedule...</div>
      ) : !data ? (
        <div className="empty-state">Failed to load data.</div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="kpi-row">
            <div className="kpi-card negative">
              <div className="kpi-label">Overdue EMIs</div>
              <div className="kpi-value">{data.summary.overdueCount}</div>
              <div className="kpi-sub">Missed payments</div>
            </div>
            <div className="kpi-card warning">
              <div className="kpi-label">Upcoming (30 days)</div>
              <div className="kpi-value">{data.summary.upcomingBillsCount}</div>
              <div className="kpi-sub">Bills & calendar events</div>
            </div>
            <div className="kpi-card info">
              <div className="kpi-label">Pending Reminders</div>
              <div className="kpi-value">{data.summary.pendingRemindersCount}</div>
              <div className="kpi-sub">Past due date</div>
            </div>
            <div className="kpi-card info">
              <div className="kpi-label">Bill Checklist Items</div>
              <div className="kpi-value">{data.billChecklist.length}</div>
              <div className="kpi-sub">Tracked bills</div>
            </div>
          </div>

          {/* Overdue Alert */}
          {data.summary.overdueCount > 0 && (
            <div className="report-table-card" style={{ borderLeft: '4px solid #ef4444', marginBottom: 20 }}>
              <div className="chart-title" style={{ color: '#991b1b', marginBottom: 10 }}>🔴 OVERDUE EMIs — Act Now!</div>
              {data.overdueEMIs.map((e, i) => (
                <div key={i} className="alert-row alert-danger">
                  <span>🏦</span>
                  <span style={{ fontWeight: 700 }}>{e.loanName}</span>
                  <span style={{ textTransform: 'capitalize' }}>{e.loanType?.replace(/-/g, ' ')}</span>
                  <span>Due: {formatDate(e.date)}</span>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>{e.daysOverdue} days overdue</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{formatCurrency(e.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="period-selector">
            {[
              { key: 'overdue', label: `⚠️ Overdue EMIs (${data.overdueEMIs.length})` },
              { key: 'upcoming', label: `📋 Upcoming EMIs (${data.upcomingEMIs.length})` },
              { key: 'calendar', label: `📆 Events (${data.calendarEvents.length})` },
              { key: 'reminders', label: `🔔 Reminders (${data.reminders.length})` },
              { key: 'bills', label: `📝 Bill Checklist (${data.billChecklist.length})` },
            ].map(t => (
              <button key={t.key} className={`period-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Overdue EMIs Tab */}
          {activeTab === 'overdue' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>Overdue EMI Payments</div>
              {data.overdueEMIs.length === 0 ? (
                <div className="empty-state">🎉 No overdue EMIs! All payments are up to date.</div>
              ) : (
                <table className="report-table">
                  <thead><tr><th>Loan</th><th>Type</th><th>Due Date</th><th>Days Overdue</th><th>Amount</th></tr></thead>
                  <tbody>
                    {data.overdueEMIs.map((e, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{e.loanName}</td>
                        <td style={{ textTransform: 'capitalize', color: '#64748b' }}>{e.loanType?.replace(/-/g, ' ')}</td>
                        <td style={{ color: '#ef4444' }}>{formatDate(e.date)}</td>
                        <td>
                          <span className="badge badge-avoidable">{e.daysOverdue} days</span>
                        </td>
                        <td className="amount-cell" style={{ color: '#ef4444' }}>{formatCurrency(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Upcoming EMIs Tab */}
          {activeTab === 'upcoming' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>Upcoming EMI Payments (Next 30 days)</div>
              {data.upcomingEMIs.length === 0 ? (
                <div className="empty-state">No upcoming EMIs in the next 30 days.</div>
              ) : (
                <table className="report-table">
                  <thead><tr><th>Loan</th><th>Type</th><th>Due Date</th><th>Days Left</th><th>Amount</th></tr></thead>
                  <tbody>
                    {data.upcomingEMIs.map((e, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{e.loanName}</td>
                        <td style={{ textTransform: 'capitalize', color: '#64748b' }}>{e.loanType?.replace(/-/g, ' ')}</td>
                        <td>{formatDate(e.date)}</td>
                        <td>
                          <span className={`badge ${e.daysUntilDue <= 3 ? 'badge-avoidable' : e.daysUntilDue <= 7 ? 'badge-less' : 'badge-important'}`}>
                            {e.daysUntilDue === 0 ? 'Today!' : `${e.daysUntilDue} days`}
                          </span>
                        </td>
                        <td className="amount-cell">{formatCurrency(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Calendar Events Tab */}
          {activeTab === 'calendar' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>Calendar Events (Next 30 days)</div>
              {data.calendarEvents.length === 0 ? (
                <div className="empty-state">No upcoming calendar events. Add events in Multiple Calendars.</div>
              ) : data.calendarEvents.map((e, i) => (
                <div key={i} className="alert-row alert-info">
                  <span>📅</span>
                  <div>
                    <span style={{ fontWeight: 600 }}>{e.title}</span>
                    {e.description && <div style={{ fontSize: 12, color: '#1e40af', marginTop: 2 }}>{e.description}</div>}
                  </div>
                  <span style={{ marginLeft: 'auto', color: '#1e40af' }}>{formatDate(e.date)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>Reminders & Notifications</div>
              {data.reminders.length === 0 ? (
                <div className="empty-state">No reminders found.</div>
              ) : data.reminders.map((r, i) => (
                <div key={i} className={`alert-row ${r.isPast ? 'alert-danger' : 'alert-info'}`}>
                  <span>{r.isPast ? '🔴' : '🔔'}</span>
                  <span style={{ fontWeight: 600 }}>{r.title}</span>
                  {r.type && <span className="badge badge-unclassified">{r.type}</span>}
                  <span style={{ marginLeft: 'auto' }}>{formatDate(r.dueDate)}</span>
                  {r.isPast && <span className="badge badge-avoidable">Past Due</span>}
                </div>
              ))}
            </div>
          )}

          {/* Bill Checklist Tab */}
          {activeTab === 'bills' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>Bill Checklist Items</div>
              {data.billChecklist.length === 0 ? (
                <div className="empty-state">No bill checklist items found.</div>
              ) : (
                <table className="report-table">
                  <thead><tr><th>Bill Name</th><th>Amount</th><th>Start Date</th><th>Payable Date</th><th>Notes</th></tr></thead>
                  <tbody>
                    {data.billChecklist.map((b, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>📝 {b.name}</td>
                        <td className="amount-cell">{b.amount ? formatCurrency(b.amount) : '—'}</td>
                        <td style={{ color: '#64748b' }}>{formatDate(b.startDate)}</td>
                        <td style={{ color: b.payableDate && new Date(b.payableDate) < new Date() ? '#ef4444' : '#64748b' }}>
                          {formatDate(b.payableDate)}
                        </td>
                        <td style={{ color: '#64748b', fontSize: 12 }}>{b.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
