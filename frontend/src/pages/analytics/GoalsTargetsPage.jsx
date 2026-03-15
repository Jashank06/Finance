import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import '../reports/Reports.css';
import api from '../../utils/api';

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function GoalsTargetsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/goals-targets');
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

  if (loading || !data) return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      {loading ? 'Calculating projections...' : 'No goals or projection data available.'}
    </div>
  );

  return (
    <div className="report-page">
      <div className="report-header">
        <h1 className="report-title">🎯 Goals & Targets</h1>
        <p className="report-subtitle">Planned vs Actual progression and 12-month financial projections</p>
      </div>

      <div className="kpi-row">
        <div className="kpi-card info">
          <div className="kpi-label">Avg. Savings</div>
          <div className="kpi-value">{formatCurrency(data.summary.avgMonthlySavings)}</div>
          <div className="kpi-sub">Monthly Average</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">Emergency Fund</div>
          <div className="kpi-value">{data.emergencyFund.percentage}%</div>
          <div className="kpi-sub">{formatCurrency(data.emergencyFund.actual)} / {formatCurrency(data.emergencyFund.required)}</div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-label">Retirement</div>
          <div className="kpi-value">{data.retirementCorpus.percentage}%</div>
          <div className="kpi-sub">Corpus Readiness</div>
        </div>
        <div className="kpi-card negative">
            <div className="kpi-label">Debt Recovery</div>
            <div className="kpi-value">{data.loanRecovery.percentage}%</div>
            <div className="kpi-sub">{formatCurrency(data.loanRecovery.repaid)} Repaid</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Income & Expense Trend (Actual)</div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={(data.income.actual6m || []).map((m, i) => ({
                month: m.month,
                income: m.total,
                expense: (data.expenses.actual6m[i] || { total: 0 }).total
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val) => formatCurrency(val)}
                />
                <Legend />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Income" />
                <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">12-Month Projections (Savings)</div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.projections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val) => formatCurrency(val)}
                />
                <Bar dataKey="projectedSavings" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Proj. Savings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="report-table-card" style={{ marginTop: '30px' }}>
        <div className="chart-title">Active Goals Progression</div>
        <table className="report-table">
          <thead>
            <tr>
              <th>Goal</th>
              <th>Target Date</th>
              <th>Planned Amount</th>
              <th>Monthly Required</th>
              <th>Projected Shortfall</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.goals.map((g, i) => {
              const shortfall = g.planned - g.projected;
              return (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{g.goal}</div>
                    <div style={{ fontSize: '11px', opacity: 0.6 }}>{g.goalType} • {g.vehicles}</div>
                  </td>
                  <td>{new Date(g.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(g.planned)}</td>
                  <td style={{ color: '#3b82f6' }}>{formatCurrency(g.monthlyRequired)}/mo</td>
                  <td style={{ color: shortfall > 0 ? '#ef4444' : '#10b981' }}>
                    {shortfall > 0 ? `-${formatCurrency(shortfall)}` : 'Covered'}
                  </td>
                  <td>
                    <span className={`badge ${shortfall > 0 ? 'badge-overdue' : 'badge-paid'}`}>
                      {shortfall > 0 ? 'Off Track' : 'On Track'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {data.goals.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                  No active goals found. Set targets in "Targets For Life" to track progress here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="charts-grid" style={{ marginTop: '30px', gridTemplateColumns: '1.5fr 1fr' }}>
        <div className="chart-card">
           <div className="chart-title">Emergency Fund Readiness</div>
           <div className="section-completion" style={{ padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px' }}>Progress to ₹{data.emergencyFund.required.toLocaleString()}</span>
                <span style={{ fontWeight: 800 }}>{data.emergencyFund.percentage}%</span>
              </div>
              <div className="progress-bar-container" style={{ height: '24px' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min(100, data.emergencyFund.percentage)}%`, background: 'linear-gradient(90deg, #3b82f6, #10b981)' }}
                ></div>
              </div>
              <div style={{ marginTop: '15px', fontSize: '12px', opacity: 0.8, background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '8px' }}>
                💡 Recommendation: At your current savings rate, you will reach your emergency fund target in <strong>{data.emergencyFund.monthsLeft} months</strong>.
              </div>
           </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Udhar Summary</div>
          <div className="kpi-card info" style={{ marginBottom: '15px' }}>
            <div className="kpi-label">O/S Udhar</div>
            <div className="kpi-value">{formatCurrency(data.udhar.total)}</div>
            <div className="kpi-sub">{data.udhar.count} Active Records</div>
          </div>
          <div className="alert-row alert-info" style={{ margin: 0, padding: '12px', fontSize: '12px' }}>
             Recovery of Udhar and Loan repayments are critical for meeting long-term goals.
          </div>
        </div>
      </div>

    </div>
  );
}
