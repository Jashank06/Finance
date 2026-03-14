import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import '../reports/Reports.css';

const API_BASE = 'http://localhost:5001/api';
const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const ASSET_COLORS = ['#6366f1','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];

const LOAN_STATUS_BADGE = {
  active: { cls: 'badge-basic', label: '✅ Active' },
  overdue: { cls: 'badge-avoidable', label: '🔴 Overdue' },
  closed: { cls: 'badge-important', label: '✔️ Closed' },
  foreclosed: { cls: 'badge-unclassified', label: '⬛ Foreclosed' },
};

export default function StatusMonitoringReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/reports/status-monitoring`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (json.success) setData(json);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="report-page">
      <div className="report-header">
        <h1 className="report-title">📊 Status & Monitoring</h1>
        <p className="report-subtitle">Investment Valuation for all investments, Liabilities, and Net Worth</p>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Loading your portfolio...</div>
      ) : !data ? (
        <div className="empty-state">Failed to load data.</div>
      ) : (
        <>
          {/* Net Worth KPI */}
          <div className="kpi-row">
            <div className="kpi-card positive">
              <div className="kpi-label">Total Assets</div>
              <div className="kpi-value">{formatCurrency(data.summary.totalAssets)}</div>
              <div className="kpi-sub">All investments combined</div>
            </div>
            <div className="kpi-card negative">
              <div className="kpi-label">Total Liabilities</div>
              <div className="kpi-value">{formatCurrency(data.summary.totalLiabilities)}</div>
              <div className="kpi-sub">Outstanding loan balances</div>
            </div>
            <div className={`kpi-card ${data.summary.netWorth >= 0 ? 'positive' : 'negative'}`}>
              <div className="kpi-label">Net Worth</div>
              <div className="kpi-value" style={{ color: data.summary.netWorth >= 0 ? '#10b981' : '#ef4444' }}>
                {formatCurrency(Math.abs(data.summary.netWorth))}
              </div>
              <div className="kpi-sub">{data.summary.netWorth >= 0 ? 'Assets exceed liabilities' : '⚠️ Liabilities exceed assets'}</div>
            </div>
            {data.liabilities.overdueEMIs.length > 0 && (
              <div className="kpi-card negative">
                <div className="kpi-label">Overdue EMIs</div>
                <div className="kpi-value">{data.liabilities.overdueEMIs.reduce((s, e) => s + e.overdueCount, 0)}</div>
                <div className="kpi-sub">Payments pending</div>
              </div>
            )}
          </div>

          {/* Overdue Alerts */}
          {data.liabilities.overdueEMIs.length > 0 && (
            <div className="report-table-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="chart-title" style={{ color: '#991b1b', marginBottom: 12 }}>🔴 Overdue EMI Alerts</div>
              {data.liabilities.overdueEMIs.map((e, i) => (
                <div key={i} className="alert-row alert-danger">
                  <span>🏦</span>
                  <span style={{ fontWeight: 600 }}>{e.loanName}</span>
                  <span>{e.overdueCount} EMI{e.overdueCount > 1 ? 's' : ''} overdue</span>
                  <span style={{ fontWeight: 700, marginLeft: 'auto' }}>Total: {formatCurrency(e.overdueAmount)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="charts-grid">
            {/* Asset Breakdown Pie */}
            {data.assetBreakdown.length > 0 && (
              <div className="chart-card">
                <div className="chart-title">🥧 Asset Allocation</div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.assetBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={95}
                      paddingAngle={2}
                    >
                      {data.assetBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color || ASSET_COLORS[i % ASSET_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend formatter={v => <span style={{ fontSize: 11, color: '#334155' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Asset Table */}
            <div className="chart-card">
              <div className="chart-title">💼 Investment Summary</div>
              {data.assetBreakdown.length === 0 ? (
                <div className="empty-state" style={{ padding: 20 }}>No investments found. Start adding investments to see your portfolio.</div>
              ) : (
                <table className="report-table">
                  <thead><tr><th>Investment Type</th><th>Value</th><th>% of Assets</th></tr></thead>
                  <tbody>
                    {data.assetBreakdown.map((asset, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="legend-dot" style={{ background: asset.color || ASSET_COLORS[i % ASSET_COLORS.length] }}></div>
                            {asset.name}
                          </div>
                        </td>
                        <td className="amount-cell">{formatCurrency(asset.value)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="progress-bar-wrap">
                              <div className="progress-bar-fill" style={{
                                width: `${data.summary.totalAssets > 0 ? Math.round((asset.value / data.summary.totalAssets) * 100) : 0}%`,
                                background: asset.color || ASSET_COLORS[i % ASSET_COLORS.length]
                              }}></div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', width: 36 }}>
                              {data.summary.totalAssets > 0 ? Math.round((asset.value / data.summary.totalAssets) * 100) : 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Loans Table */}
          {data.liabilities.loans.length > 0 && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>🏦 Liabilities — Active Loans</div>
              <table className="report-table">
                <thead>
                  <tr><th>Loan Name</th><th>Company</th><th>Type</th><th>Principal</th><th>Balance</th><th>EMI Amount</th><th>EMI Date</th><th>Rate %</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {data.liabilities.loans.map((loan, i) => {
                    const badge = LOAN_STATUS_BADGE[loan.status] || LOAN_STATUS_BADGE.active;
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{loan.name}</td>
                        <td>{loan.company}</td>
                        <td style={{ textTransform: 'capitalize', color: '#64748b' }}>{loan.type?.replace(/-/g, ' ')}</td>
                        <td className="amount-cell">{formatCurrency(loan.principal)}</td>
                        <td className="amount-cell" style={{ color: '#ef4444' }}>{formatCurrency(loan.balance)}</td>
                        <td className="amount-cell">{formatCurrency(loan.emiAmount)}</td>
                        <td style={{ color: '#64748b' }}>{loan.emiDate}</td>
                        <td>{loan.interestRate}%</td>
                        <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
