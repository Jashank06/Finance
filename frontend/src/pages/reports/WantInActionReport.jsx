import { useState, useEffect } from 'react';
import '../reports/Reports.css';
import api from '../../utils/api';
const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const LOAN_TYPE_ICON = {
  'home-loan': '🏠', 'personal-loan': '👤', 'car-loan': '🚗',
  'education-loan': '🎓', 'business-loan': '💼', 'gold-loan': '💛',
  'credit-card': '💳', 'other': '🔷',
};

export default function WantInActionReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('loans');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/reports/want-in-action');
        if (res.data && res.data.success) setData(res.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const tabs = [
    { key: 'loans', label: `🏦 Loans (${data?.loans?.activeCount || 0})` },
    { key: 'udhar', label: `💸 Udhar (${data?.udhar?.total || 0})` },
    { key: 'telephone', label: `📞 Follow-ups (${data?.telephoneFollowups?.total || 0})` },
    { key: 'reminders', label: `🔔 Reminders (${data?.reminders?.length || 0})` },
  ];

  return (
    <div className="report-page">
      <div className="report-header">
        <h1 className="report-title">⚡ Want In Action</h1>
        <p className="report-subtitle">Tasks, Follow-ups, Udhar Lena-Dena, and Loan status — all in one place</p>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Loading action items...</div>
      ) : !data ? (
        <div className="empty-state">Failed to load data.</div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="kpi-row">
            <div className="kpi-card negative">
              <div className="kpi-label">Active Loans</div>
              <div className="kpi-value">{data.loans.activeCount}</div>
              <div className="kpi-sub">Balance: {formatCurrency(data.loans.totalBalance)}</div>
            </div>
            <div className="kpi-card warning">
              <div className="kpi-label">Overdue Loans</div>
              <div className="kpi-value">{data.loans.overdueLoans.length}</div>
              <div className="kpi-sub">Need immediate attention</div>
            </div>
            <div className="kpi-card info">
              <div className="kpi-label">Udhar Records</div>
              <div className="kpi-value">{data.udhar.total}</div>
              <div className="kpi-sub">Lena / Dena / On behalf</div>
            </div>
            <div className="kpi-card info">
              <div className="kpi-label">Pending Follow-ups</div>
              <div className="kpi-value">{data.telephoneFollowups.total}</div>
              <div className="kpi-sub">Telephone conversations</div>
            </div>
          </div>

          {/* Overdue Alert */}
          {data.loans.overdueLoans.length > 0 && (
            <div className="report-table-card" style={{ borderLeft: '4px solid #ef4444', marginBottom: 20 }}>
              <div className="chart-title" style={{ color: '#991b1b', marginBottom: 10 }}>🚨 Overdue Loans — Immediate Action Required</div>
              {data.loans.overdueLoans.map((l, i) => (
                <div key={i} className="alert-row alert-danger">
                  <span>🔴</span>
                  <span style={{ fontWeight: 700 }}>{l.name}</span>
                  <span>EMI: {formatCurrency(l.emiAmount)}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>Balance: {formatCurrency(l.balance)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="period-selector">
            {tabs.map(t => (
              <button key={t.key} className={`period-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Loans Tab */}
          {activeTab === 'loans' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>📅 Upcoming EMI Schedule (Next 30 days)</div>
              {data.loans.nextEMIs.length === 0 ? (
                <div className="empty-state">No upcoming EMIs found.</div>
              ) : (
                <table className="report-table">
                  <thead><tr><th>Loan</th><th>Company</th><th>EMI Amount</th><th>Outstanding Balance</th><th>Next Due Date</th><th>Days Left</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.loans.nextEMIs.map((emi, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{LOAN_TYPE_ICON[emi.status] || '🔷'} {emi.loanName}</td>
                        <td style={{ color: '#64748b' }}>{emi.company}</td>
                        <td className="amount-cell">{formatCurrency(emi.emiAmount)}</td>
                        <td className="amount-cell" style={{ color: '#ef4444' }}>{formatCurrency(emi.balance)}</td>
                        <td>{formatDate(emi.nextDue)}</td>
                        <td>
                          <span className={`badge ${emi.daysUntilDue <= 3 ? 'badge-avoidable' : emi.daysUntilDue <= 7 ? 'badge-less' : 'badge-basic'}`}>
                            {emi.daysUntilDue === 0 ? 'Today!' : `${emi.daysUntilDue} days`}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${emi.status === 'overdue' ? 'badge-avoidable' : 'badge-important'}`}>
                            {emi.status === 'overdue' ? '🔴 Overdue' : '✅ Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Udhar Tab */}
          {activeTab === 'udhar' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>💸 Udhar Lena / Dena Records</div>
              {data.udhar.records.length === 0 ? (
                <div className="empty-state">No Udhar/On-behalf records found.</div>
              ) : (
                <table className="report-table">
                  <thead><tr><th>Name</th><th>Type</th><th>Amount</th><th>Date</th><th>Notes</th></tr></thead>
                  <tbody>
                    {data.udhar.records.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{r.name || '—'}</td>
                        <td><span className="badge badge-basic">{r.category?.replace(/-/g, ' ')}</span></td>
                        <td className="amount-cell">{formatCurrency(r.amount)}</td>
                        <td style={{ color: '#64748b' }}>{formatDate(r.date)}</td>
                        <td style={{ color: '#64748b', fontSize: 12 }}>{r.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Telephone Tab */}
          {activeTab === 'telephone' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>📞 Telephone Follow-ups Pending</div>
              {data.telephoneFollowups.records.length === 0 ? (
                <div className="empty-state">No phone follow-up records found.</div>
              ) : (
                <table className="report-table">
                  <thead><tr><th>Person/Company</th><th>Date</th><th>Notes</th></tr></thead>
                  <tbody>
                    {data.telephoneFollowups.records.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>📞 {r.name || '—'}</td>
                        <td style={{ color: '#64748b' }}>{formatDate(r.date)}</td>
                        <td style={{ color: '#64748b', fontSize: 12 }}>{r.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>🔔 Upcoming Reminders (Next 30 days)</div>
              {data.reminders.length === 0 ? (
                <div className="empty-state">No upcoming reminders found.</div>
              ) : data.reminders.map((r, i) => (
                <div key={i} className={`alert-row ${r.isPast ? 'alert-danger' : 'alert-info'}`}>
                  <span>{r.isPast ? '🔴' : '🔔'}</span>
                  <span style={{ fontWeight: 600 }}>{r.title}</span>
                  <span style={{ color: '#64748b', fontSize: 12 }}>{r.type}</span>
                  <span style={{ marginLeft: 'auto' }}>{formatDate(r.dueDate)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
