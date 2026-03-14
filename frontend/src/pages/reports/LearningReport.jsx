import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import '../reports/Reports.css';

const API_BASE = 'http://localhost:5001/api';
const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const SIN_COLORS = ['#ef4444','#f97316','#ec4899','#8b5cf6','#10b981','#3b82f6','#f59e0b','#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: '4px 0 0', color: p.color || p.fill, fontWeight: 600 }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LearningReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sin');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/reports/learning`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs = [
    { key: 'sin', label: '🔴 Sin Expenses' },
    { key: 'overflow', label: '💸 Expense Overflow' },
    { key: 'shortfall', label: '📉 Investment Shortfall' },
    { key: 'fines', label: '🚨 Fines & Penalties' },
  ];

  return (
    <div className="report-page">
      <div className="report-header">
        <h1 className="report-title">📚 Learning</h1>
        <p className="report-subtitle">Identify bad financial habits — sin expenses, overflows, shortfalls & penalties (Last 6 months)</p>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Analyzing spending patterns...</div>
      ) : !data ? (
        <div className="empty-state">Failed to load data.</div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="kpi-row">
            <div className="kpi-card negative">
              <div className="kpi-label">Sin Expenses Total</div>
              <div className="kpi-value">{formatCurrency(data.sinExpenses.total)}</div>
              <div className="kpi-sub">{data.sinExpenses.count} transactions</div>
            </div>
            <div className="kpi-card warning">
              <div className="kpi-label">Overflow Months</div>
              <div className="kpi-value">{data.expenseOverflow.overflowMonths}</div>
              <div className="kpi-sub">Expenses exceeded income</div>
            </div>
            <div className="kpi-card info">
              <div className="kpi-label">Investment Shortfall</div>
              <div className="kpi-value">{formatCurrency(data.investmentShortfall.shortfall)}</div>
              <div className="kpi-sub">vs goals targeted</div>
            </div>
            <div className="kpi-card negative">
              <div className="kpi-label">Fines & Penalties</div>
              <div className="kpi-value">{formatCurrency(data.finesAndPenalties.total)}</div>
              <div className="kpi-sub">{data.finesAndPenalties.count} transactions</div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="period-selector">
            {tabs.map(t => (
              <button key={t.key} className={`period-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Sin Expenses Tab */}
          {activeTab === 'sin' && (
            <>
              <div className="charts-grid">
                <div className="chart-card">
                  <div className="chart-title">Sin Expense Breakdown by Category</div>
                  {data.sinExpenses.byCategory.length === 0 ? (
                    <div className="empty-state" style={{ padding: 30 }}>🎉 No sin expenses found! Great job.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={data.sinExpenses.byCategory.slice(0, 8)} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                          {data.sinExpenses.byCategory.slice(0, 8).map((_, i) => (
                            <Cell key={i} fill={SIN_COLORS[i % SIN_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={v => formatCurrency(v)} />
                        <Legend formatter={v => <span style={{ fontSize: 11, color: '#334155' }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="chart-card">
                  <div className="chart-title">Monthly: Sin vs Total Expenses vs Income</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
                      <Bar dataKey="income" name="Income" fill="#10b981" radius={[3,3,0,0]} />
                      <Bar dataKey="totalExpenses" name="Total Expenses" fill="#6366f1" radius={[3,3,0,0]} />
                      <Bar dataKey="sinExpenses" name="Sin Expenses" fill="#ef4444" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {data.sinExpenses.recentTransactions.length > 0 && (
                <div className="report-table-card">
                  <div className="chart-title" style={{ marginBottom: 16 }}>Recent Sin/Avoidable Transactions</div>
                  <table className="report-table">
                    <thead>
                      <tr><th>Date</th><th>Merchant</th><th>Category</th><th>Type</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                      {data.sinExpenses.recentTransactions.map((t, i) => (
                        <tr key={i}>
                          <td style={{ color: '#64748b' }}>{formatDate(t.date)}</td>
                          <td style={{ fontWeight: 500 }}>{t.merchant}</td>
                          <td>{t.category || '—'}</td>
                          <td>
                            <span className={`badge ${t.expenseType === 'unnecessary' ? 'badge-unnecessary' : 'badge-avoidable'}`}>
                              {t.expenseType === 'unnecessary' ? '❌ Unnecessary' : '🔴 Avoidable'}
                            </span>
                          </td>
                          <td className="amount-cell" style={{ color: '#ef4444' }}>{formatCurrency(t.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Expense Overflow Tab */}
          {activeTab === 'overflow' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>
                💸 Months Where Expenses Exceeded Income
                <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 400, color: '#64748b' }}>
                  (Total deficit: {formatCurrency(data.expenseOverflow.totalOverflow)})
                </span>
              </div>
              {data.expenseOverflow.months.length === 0 ? (
                <div className="empty-state">🎉 No overflow months — your income covered all expenses!</div>
              ) : (
                <>
                  <div className="charts-grid" style={{ marginBottom: 20 }}>
                    <div className="chart-card">
                      <div className="chart-title">Income vs Expenses by Month</div>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
                          <Bar dataKey="income" name="Income" fill="#10b981" radius={[3,3,0,0]} />
                          <Bar dataKey="totalExpenses" name="Expenses" fill="#ef4444" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {data.expenseOverflow.months.map((m, i) => (
                    <div key={i} className="alert-row alert-danger">
                      <span>📅 {m.month}</span>
                      <span>Income: {formatCurrency(m.income)}</span>
                      <span>Expenses: {formatCurrency(m.totalExpenses)}</span>
                      <span style={{ fontWeight: 700 }}>Deficit: {formatCurrency(m.overflow)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Investment Shortfall Tab */}
          {activeTab === 'shortfall' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>📉 Investment vs Goals</div>
              <div className="kpi-row" style={{ marginBottom: 20 }}>
                <div className="kpi-card info">
                  <div className="kpi-label">Total Goals Targeted</div>
                  <div className="kpi-value">{formatCurrency(data.investmentShortfall.totalTargeted)}</div>
                </div>
                <div className="kpi-card positive">
                  <div className="kpi-label">Total Invested</div>
                  <div className="kpi-value">{formatCurrency(data.investmentShortfall.totalInvested)}</div>
                </div>
                <div className="kpi-card negative">
                  <div className="kpi-label">Shortfall</div>
                  <div className="kpi-value">{formatCurrency(data.investmentShortfall.shortfall)}</div>
                </div>
              </div>
              {data.investmentShortfall.targets.length === 0 ? (
                <div className="empty-state">No goals set yet. Add targets in <strong>Targets for Life</strong>.</div>
              ) : (
                <table className="report-table">
                  <thead><tr><th>Goal</th><th>Type</th><th>Target Amount</th><th>Target Date</th></tr></thead>
                  <tbody>
                    {data.investmentShortfall.targets.map((t, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{t.goal}</td>
                        <td><span className="badge badge-info">{t.goalType}</span></td>
                        <td className="amount-cell">{formatCurrency(t.estimatedCost)}</td>
                        <td style={{ color: '#64748b' }}>{formatDate(t.targetDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Fines & Penalties Tab */}
          {activeTab === 'fines' && (
            <div className="report-table-card">
              <div className="chart-title" style={{ marginBottom: 16 }}>🚨 Fines, Penalties & Avoidable Charges</div>
              {data.finesAndPenalties.count === 0 ? (
                <div className="empty-state">🎉 No fines or penalties found!</div>
              ) : (
                <table className="report-table">
                  <thead><tr><th>Date</th><th>Merchant/Payee</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
                  <tbody>
                    {data.finesAndPenalties.transactions.map((t, i) => (
                      <tr key={i}>
                        <td style={{ color: '#64748b' }}>{formatDate(t.date)}</td>
                        <td style={{ fontWeight: 500 }}>{t.merchant}</td>
                        <td style={{ color: '#64748b', fontSize: 12 }}>{t.description || '—'}</td>
                        <td>{t.category || '—'}</td>
                        <td className="amount-cell" style={{ color: '#ef4444' }}>{formatCurrency(t.amount)}</td>
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
