import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Cell, PieChart, Pie
} from 'recharts';
import '../reports/Reports.css';
import api from '../../utils/api';

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const BUCKET_COLORS = {
  needs: '#3b82f6',     // Blue
  wants: '#f59e0b',     // Amber
  savings: '#10b981',   // Emerald
  investment: '#8b5cf6',// Violet
  survivalBuffer: '#64748b' // Slate
};

export default function ExpensesLevelsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/expenses-levels');
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data || !data.budgetPlan) return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      {loading ? 'Analyzing expense levels...' : 'No budget plan found. Please set a budget plan in Analytics > Assumptions or Family > Static > Budget Page.'}
    </div>
  );

  return (
    <div className="report-page">
      <div className="report-header">
        <h1 className="report-title">⚖️ Expenses Levels</h1>
        <p className="report-subtitle">Variance analysis: Actual spending vs {data.budgetPlan.planName} benchmarks</p>
      </div>

      <div className="kpi-row">
        <div className="kpi-card info">
          <div className="kpi-label">Active Plan</div>
          <div className="kpi-value" style={{ fontSize: '20px' }}>{data.budgetPlan.planName}</div>
          <div className="kpi-sub">Monthly Income: {formatCurrency(data.budgetPlan.monthlyIncome)}</div>
        </div>
        <div className="kpi-card negative">
          <div className="kpi-label">Avg. Monthly Exp.</div>
          <div className="kpi-value">{formatCurrency(data.summary.avgMonthlyExpense)}</div>
          <div className="kpi-sub">Last 6 Months Average</div>
        </div>
        <div className={`kpi-card ${data.summary.incomeExpenseRatio > 80 ? 'negative' : 'success'}`}>
          <div className="kpi-label">Income/Expense Ratio</div>
          <div className="kpi-value">{data.summary.incomeExpenseRatio}%</div>
          <div className="kpi-sub">Target: {100 - data.budgetPlan.allocations.savings}% or less</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Actual Allocation (by Category Bucket)</div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.bucketComparison}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="actualAmount"
                  nameKey="bucket"
                >
                  {data.bucketComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BUCKET_COLORS[entry.bucket] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  formatter={(val) => formatCurrency(val)}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Plan vs Actual Variance (Monthly)</div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bucketComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis dataKey="bucket" type="category" stroke="#64748b" width={80} tick={{fontSize: 11}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val) => formatCurrency(val)}
                />
                <Legend />
                <Bar dataKey="targetAmount" fill="rgba(255,255,255,0.2)" name="Target Limit" radius={[0, 4, 4, 0]} />
                <Bar dataKey="actualAmount" fill="#3b82f6" name="Actual Avg" radius={[0, 4, 4, 0]}>
                   {data.bucketComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.diff > 1000 ? '#ef4444' : BUCKET_COLORS[entry.bucket]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="report-table-card" style={{ marginTop: '30px' }}>
        <div className="chart-title">Variance Insights</div>
        <table className="report-table">
          <thead>
            <tr>
              <th>Category Bucket</th>
              <th>Target Allocation</th>
              <th>Target Amount</th>
              <th>Actual Avg</th>
              <th>Variance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.bucketComparison.map((b, i) => (
              <tr key={i}>
                <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{b.bucket.replace(/([A-Z])/g, ' $1')}</td>
                <td>{b.targetPct}%</td>
                <td>{formatCurrency(b.targetAmount)}</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(b.actualAmount)}</td>
                <td style={{ color: b.diff > 0 ? '#ef4444' : '#10b981' }}>
                  {b.diff > 0 ? `+${formatCurrency(b.diff)}` : formatCurrency(b.diff)}
                </td>
                <td>
                  <span className={`badge ${b.diff > 2000 ? 'badge-overdue' : b.diff < -2000 ? 'badge-paid' : 'badge-upcoming'}`}>
                    {b.diff > 2000 ? 'Over Limit' : b.diff < -2000 ? 'Well Within' : 'On Track'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="chart-card" style={{ marginTop: '30px' }}>
        <div className="chart-title">Broader Category Breakdown (Last 6 Months Monthly Avg)</div>
        <table className="report-table" style={{ fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Broader Category</th>
              <th>Bucket</th>
              <th>Monthly Avg</th>
              <th>% of Total Exp.</th>
              <th>% of Income</th>
            </tr>
          </thead>
          <tbody>
            {data.categoryBreakdown.map((c, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{c.category}</td>
                <td style={{ textTransform: 'capitalize', color: BUCKET_COLORS[c.bucket] }}>{c.bucket}</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(c.monthlyAvg)}</td>
                <td>{c.pctOfExpense}%</td>
                <td>{c.pctOfIncome}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="chart-card" style={{ marginTop: '30px' }}>
        <div className="chart-title">Allocation Comparison across Plans</div>
        <div className="section-completion" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {data.allPlans.map((p, i) => (
            <div 
              key={i} 
              className={`kpi-card ${p.key === data.budgetPlan.planKey ? 'info' : ''}`}
              style={{ background: 'rgba(255,255,255,0.03)', border: p.key === data.budgetPlan.planKey ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)' }}
            >
              <div style={{ fontWeight: 800, marginBottom: '10px' }}>{p.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                Needs: {p.needs}%<br/>
                Wants: {p.wants}%<br/>
                Savings: {p.savings}%<br/>
                Invest: {p.investment}%
              </div>
              {p.key === data.budgetPlan.planKey && (
                <div style={{ marginTop: '10px', fontSize: '11px', fontWeight: 800, color: '#3b82f6' }}>ACTIVE PLAN</div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
