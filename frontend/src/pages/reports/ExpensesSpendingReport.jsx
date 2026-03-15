import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import '../reports/Reports.css';
import api from '../../utils/api';

const EXPENSE_TYPE_COLORS = {
  'important-necessary': '#10b981',
  'basic-necessity': '#3b82f6',
  'less-important': '#f59e0b',
  'avoidable-loss': '#ef4444',
  'unnecessary': '#ec4899',
  'unclassified': '#94a3b8',
};

const BADGE_CLASS = {
  'important-necessary': 'badge-important',
  'basic-necessity': 'badge-basic',
  'less-important': 'badge-less',
  'avoidable-loss': 'badge-avoidable',
  'unnecessary': 'badge-unnecessary',
  'unclassified': 'badge-unclassified',
};

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const BROADER_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

function CategoryTreeNode({ node, index }) {
  const [open, setOpen] = useState(false);
  const color = BROADER_COLORS[index % BROADER_COLORS.length];

  return (
    <div className="tree-broader">
      <div className="tree-broader-header" onClick={() => setOpen(!open)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14 }}>{open ? '▼' : '▶'}</span>
          <span>{node.broaderCategory}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="pct-pill">{node.percentage}%</span>
          <span className="amount-cell">{formatCurrency(node.total)}</span>
        </div>
      </div>
      {open && (
        <div>
          {node.mainCategories.map((main, mi) => (
            <MainCategoryNode key={mi} main={main} />
          ))}
        </div>
      )}
    </div>
  );
}

function MainCategoryNode({ main }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: '1px solid #f1f5f9' }}>
      <div className="tree-main-row" style={{ paddingLeft: 32, paddingRight: 18 }} onClick={() => setOpen(!open)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{open ? '▼' : '▶'}</span>
          {main.mainCategory}
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="pct-pill">{main.percentage}%</span>
          <span className="amount-cell">{formatCurrency(main.total)}</span>
        </div>
      </div>
      {open && main.subCategories.map((sub, si) => (
        <div key={si} className="tree-sub" style={{ paddingLeft: 60, paddingRight: 18 }}>
          <span style={{ color: '#64748b' }}>• {sub.subCategory} <span style={{ color: '#94a3b8' }}>({sub.count})</span></span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(sub.total)}</span>
        </div>
      ))}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: '4px 0 0', color: p.fill || p.color, fontSize: 12, fontWeight: 600 }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ExpensesSpendingReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/expenses-spending', {
        params: { dateFrom, dateTo }
      });
      if (res.data && res.data.success) setData(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setPeriod = (p) => {
    const now = new Date();
    if (p === 'thisMonth') {
      setDateFrom(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
      setDateTo(now.toISOString().split('T')[0]);
    } else if (p === 'lastMonth') {
      setDateFrom(new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]);
      setDateTo(new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]);
    } else if (p === 'thisYear') {
      setDateFrom(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
      setDateTo(now.toISOString().split('T')[0]);
    } else if (p === 'last3M') {
      setDateFrom(new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0]);
      setDateTo(now.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="report-page">
      <div className="report-header">
        <h1 className="report-title">💰 Expenses / Spending</h1>
        <p className="report-subtitle">Broad → Main → Sub Category wise spending analysis across all accounts</p>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="period-selector" style={{ margin: 0 }}>
          {[
            { key: 'thisMonth', label: 'This Month' },
            { key: 'lastMonth', label: 'Last Month' },
            { key: 'last3M', label: 'Last 3 Months' },
            { key: 'thisYear', label: 'This Year' },
          ].map(p => (
            <button key={p.key} className="period-btn" onClick={() => setPeriod(p.key)}>{p.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#334155' }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#334155' }} />
          <button onClick={fetchData} style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          Analyzing your expenses...
        </div>
      ) : !data ? (
        <div className="empty-state">Failed to load data. Please try again.</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="kpi-row">
            <div className="kpi-card negative">
              <div className="kpi-label">Total Expenses</div>
              <div className="kpi-value">{formatCurrency(data.summary.totalExpenses)}</div>
              <div className="kpi-sub">{data.summary.totalTransactions} transactions</div>
            </div>
            <div className="kpi-card info" style={{ '--accent': '#6366f1' }}>
              <div className="kpi-label">Categories</div>
              <div className="kpi-value">{data.categoryTree.length}</div>
              <div className="kpi-sub">Broader categories</div>
            </div>
            {data.expenseTypeBreakdown.find(e => e.key === 'avoidable-loss' || e.key === 'unnecessary') && (
              <div className="kpi-card warning">
                <div className="kpi-label">Sin / Avoidable</div>
                <div className="kpi-value">
                  {formatCurrency(
                    (data.expenseTypeBreakdown.find(e => e.key === 'avoidable-loss')?.total || 0) +
                    (data.expenseTypeBreakdown.find(e => e.key === 'unnecessary')?.total || 0)
                  )}
                </div>
                <div className="kpi-sub">Could have saved</div>
              </div>
            )}
            <div className="kpi-card positive">
              <div className="kpi-label">Important & Necessary</div>
              <div className="kpi-value">
                {data.expenseTypeBreakdown.find(e => e.key === 'important-necessary')?.percentage || 0}%
              </div>
              <div className="kpi-sub">Of total expenses</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-grid">
            {/* Monthly Trend */}
            <div className="chart-card">
              <div className="chart-title">📊 Monthly Expense Trend</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Expenses" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Type Donut */}
            <div className="chart-card">
              <div className="chart-title">🏷️ Expense Type Breakdown</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.expenseTypeBreakdown.filter(e => e.total > 0)}
                    dataKey="total"
                    nameKey="label"
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={2}
                  >
                    {data.expenseTypeBreakdown.map((entry, i) => (
                      <Cell key={i} fill={EXPENSE_TYPE_COLORS[entry.key] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#334155' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Type Details */}
          <div className="report-table-card">
            <div className="chart-title" style={{ marginBottom: 16 }}>🏷️ Expense Type Analysis</div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>% of Total</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {data.expenseTypeBreakdown.filter(e => e.count > 0).map((e, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`badge ${BADGE_CLASS[e.key] || 'badge-unclassified'}`}>
                        {e.key === 'important-necessary' && '✅'}
                        {e.key === 'basic-necessity' && '🔵'}
                        {e.key === 'less-important' && '⚠️'}
                        {e.key === 'avoidable-loss' && '🔴'}
                        {e.key === 'unnecessary' && '❌'}
                        {e.key === 'unclassified' && '⬛'}
                        {' '}{e.label}
                      </span>
                    </td>
                    <td className="amount-cell">{formatCurrency(e.total)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="progress-bar-wrap">
                          <div className="progress-bar-fill" style={{ width: `${e.percentage}%`, background: EXPENSE_TYPE_COLORS[e.key] || '#94a3b8' }}></div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', width: 36 }}>{e.percentage}%</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b' }}>{e.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Category Tree */}
          <div className="report-table-card">
            <div className="chart-title" style={{ marginBottom: 16 }}>🗂️ Category Breakdown (Click to expand)</div>
            {data.categoryTree.length === 0 ? (
              <div className="empty-state">No categorized transactions found for this period.</div>
            ) : data.categoryTree.map((node, i) => (
              <CategoryTreeNode key={i} node={node} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
