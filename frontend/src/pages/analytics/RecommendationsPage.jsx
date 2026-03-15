import { useState, useEffect, useCallback } from 'react';
import '../reports/Reports.css';
import api from '../../utils/api';

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function RecommendationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/recommendations');
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
      {loading ? 'Generating recommendations...' : 'No recommendations available at the moment.'}
    </div>
  );

  return (
    <div className="report-page">
      <div className="report-header">
        <h1 className="report-title">💡 Smart Recommendations</h1>
        <p className="report-subtitle">Personalized financial advice based on your income, age, and risk profile</p>
      </div>

      <div className="kpi-row">
        <div className="kpi-card info">
          <div className="kpi-label">Month Surplus</div>
          <div className="kpi-value">{formatCurrency(data.summary.monthlySavings)}</div>
          <div className="kpi-sub">Income - Avg Expense</div>
        </div>
        <div className="kpi-card negative">
          <div className="kpi-label">Liabilities</div>
          <div className="kpi-value">{formatCurrency(data.summary.totalLoans)}</div>
          <div className="kpi-sub">Total O/S Principal</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">Investments</div>
          <div className="kpi-value">{formatCurrency(data.summary.totalInvestments)}</div>
          <div className="kpi-sub">Current Market Value</div>
        </div>
      </div>

      <div className="charts-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <div className="chart-card">
          <div className="chart-title">Prioritized Action Items</div>
          <div className="section-completion" style={{ gap: '15px' }}>
            {data.recommendations.map((rec, i) => (
              <div key={i} className={`alert-row ${
                rec.priority === 'High' ? 'alert-danger' : 
                rec.priority === 'Medium' ? 'alert-warning' : 'alert-info'
              }`} style={{ margin: 0, padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px', marginRight: '20px' }}>{rec.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>{rec.title}</div>
                    <span className={`badge ${
                      rec.priority === 'High' ? 'badge-overdue' : 
                      rec.priority === 'Medium' ? 'badge-upcoming' : 'badge-paid'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569', marginBottom: '12px', fontWeight: 500 }}>
                    {rec.detail}
                  </div>
                  <div style={{ 
                    background: 'rgba(0,0,0,0.05)', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontSize: '13px',
                    color: '#334155',
                    borderLeft: '4px solid currentColor'
                  }}>
                    <strong>Recommendation:</strong> {rec.action}
                  </div>
                </div>
                {rec.amount > 0 && (
                  <div style={{ 
                    textAlign: 'right', 
                    marginLeft: '20px', 
                    minWidth: '120px',
                    alignSelf: 'center'
                  }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Req. Capital</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(rec.amount)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="report-table-card" style={{ marginTop: '30px' }}>
        <div className="chart-title">Strategy Overview</div>
        <div className="kpi-row" style={{ marginTop: '20px' }}>
          <div className="kpi-card" style={{ background: 'var(--card-bg)' }}>
            <div className="kpi-label">Protection Gap</div>
            <div className="kpi-value" style={{ color: '#ef4444' }}>
              {formatCurrency(Math.max(0, data.summary.termPlanRequired - data.summary.totalInvestments))}
            </div>
            <div className="kpi-sub">Uncovered Life Cover</div>
          </div>
          <div className="kpi-card" style={{ background: 'var(--card-bg)' }}>
            <div className="kpi-label">Buffer Gap</div>
            <div className="kpi-value" style={{ color: '#f59e0b' }}>
              {formatCurrency(Math.max(0, data.summary.emergencyFundRequired - data.summary.totalInvestments))}
            </div>
            <div className="kpi-sub">Emergency Fund Gap</div>
          </div>
        </div>
      </div>
    </div>
  );
}
