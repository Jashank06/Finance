import { useState, useEffect, useCallback } from 'react';
import '../reports/Reports.css';
import api from '../../utils/api';

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function AssumptionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/assumptions');
      if (res.data && res.data.success) {
        setData(res.data);
        setEditForm(res.data.assumptions);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post('/analytics/assumptions', editForm);
      if (res.data && res.data.success) {
        await fetchData(); // Refresh computed values
        alert('Assumptions saved successfully!');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving assumptions');
    }
    setSaving(false);
  };

  if (loading || !data) return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      {loading ? 'Loading assumptions...' : 'No data found. Please check your internet connection or try again later.'}
    </div>
  );

  return (
    <div className="report-page">
      <div className="report-header">
        <h1 className="report-title">⚙️ Default Assumptions</h1>
        <p className="report-subtitle">Configure the baseline parameters for financial planning and recommendations</p>
      </div>

      <div className="charts-grid">
        {/* Left: Configuration Form */}
        <div className="chart-card">
          <div className="chart-title">Configure Parameters</div>
          <div className="section-completion" style={{ gap: '20px' }}>
            
            <div className="completion-row">
              <label className="completion-label">Retirement Age</label>
              <input 
                type="number" 
                value={editForm.retirementAge} 
                onChange={e => setEditForm({...editForm, retirementAge: parseInt(e.target.value)})}
                className="period-btn" style={{ width: '80px', textAlign: 'center' }}
              />
              <span className="kpi-sub" style={{ width: '100px' }}>Years</span>
            </div>

            <div className="completion-row">
              <label className="completion-label">Term Plan Cover</label>
              <input 
                type="number" 
                value={editForm.termPlanMultiplier} 
                onChange={e => setEditForm({...editForm, termPlanMultiplier: parseInt(e.target.value)})}
                className="period-btn" style={{ width: '80px', textAlign: 'center' }}
              />
              <span className="kpi-sub" style={{ width: '100px' }}>× Annual Income</span>
            </div>

            <div className="completion-row">
              <label className="completion-label">Emergency Fund</label>
              <input 
                type="number" 
                value={editForm.emergencyFundMonths} 
                onChange={e => setEditForm({...editForm, emergencyFundMonths: parseInt(e.target.value)})}
                className="period-btn" style={{ width: '80px', textAlign: 'center' }}
              />
              <span className="kpi-sub" style={{ width: '100px' }}>Months of Exp.</span>
            </div>

            <div className="completion-row">
              <label className="completion-label">Health Insurance</label>
              <input 
                type="number" 
                value={editForm.healthInsuranceCover} 
                onChange={e => setEditForm({...editForm, healthInsuranceCover: parseInt(e.target.value)})}
                className="period-btn" style={{ width: '120px', textAlign: 'center' }}
              />
              <span className="kpi-sub" style={{ width: '100px' }}>Sum Insured (₹)</span>
            </div>

            <div className="completion-row">
              <label className="completion-label">Budget Plan</label>
              <select 
                value={editForm.budgetPlan} 
                onChange={e => setEditForm({...editForm, budgetPlan: e.target.value})}
                className="period-btn" style={{ width: '180px' }}
              >
                <option value="bare_minimum">Bare Minimum (80-0-20)</option>
                <option value="most_popular">Most Popular (50-30-20)</option>
                <option value="standard">Standard (40-30-30)</option>
                <option value="stable">Stable (60-30-10)</option>
                <option value="good">Good (60-20-10-10)</option>
              </select>
            </div>

            <div className="completion-row">
              <label className="completion-label">Income Basis</label>
              <select 
                value={editForm.incomeBase} 
                onChange={e => setEditForm({...editForm, incomeBase: e.target.value})}
                className="period-btn" style={{ width: '180px' }}
              >
                <option value="lower_6m">Lowest of last 6 Months</option>
                <option value="avg_6m">Average of last 6 Months</option>
              </select>
            </div>

            <div className="completion-row">
              <label className="completion-label">Expense Basis</label>
              <select 
                value={editForm.expenseBase} 
                onChange={e => setEditForm({...editForm, expenseBase: e.target.value})}
                className="period-btn" style={{ width: '180px' }}
              >
                <option value="higher_6m">Highest of last 6 Months</option>
                <option value="avg_6m">Average of last 6 Months</option>
              </select>
            </div>

            <button 
              className="period-btn active" 
              style={{ marginTop: '10px', width: '100%', padding: '12px' }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save & Apple Changes'}
            </button>

          </div>
        </div>

        {/* Right: Computed Reality */}
        <div className="chart-card">
          <div className="chart-title">Computed Planning Bases</div>
          <div className="kpi-row" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="kpi-card info">
              <div className="kpi-label">Present Income</div>
              <div className="kpi-value" style={{ fontSize: '20px' }}>{formatCurrency(data.computed.presentMonthlyIncome)}</div>
              <div className="kpi-sub">Monthly Base</div>
            </div>
            <div className="kpi-card negative">
              <div className="kpi-label">Present Expense</div>
              <div className="kpi-value" style={{ fontSize: '20px' }}>{formatCurrency(data.computed.presentMonthlyExpense)}</div>
              <div className="kpi-sub">Monthly Base</div>
            </div>
          </div>

          <div className="report-table-card" style={{ marginTop: '20px', padding: '15px' }}>
            <div className="kpi-label" style={{ marginBottom: '15px' }}>Planning Requirements</div>
            <div className="section-completion" style={{ gap: '15px' }}>
              <div className="alert-row alert-info" style={{ margin: 0 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>Emergency Fund</div>
                  <div style={{ fontSize: '11px' }}>{editForm.emergencyFundMonths} months coverage</div>
                </div>
                <div style={{ fontWeight: 800 }}>{formatCurrency(data.computed.emergencyFundRequired)}</div>
              </div>

              <div className="alert-row alert-warning" style={{ margin: 0 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>Term Life Insurance</div>
                  <div style={{ fontSize: '11px' }}>{editForm.termPlanMultiplier}× Annual Income</div>
                </div>
                <div style={{ fontWeight: 800 }}>{formatCurrency(data.computed.termPlanRequired)}</div>
              </div>

              <div className="alert-row alert-success" style={{ margin: 0 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>Retirement Corpus</div>
                  <div style={{ fontSize: '11px' }}>Projected at Age {editForm.retirementAge}</div>
                </div>
                <div style={{ fontWeight: 800 }}>{formatCurrency(data.computed.presentMonthlyExpense * 12 * 25)}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div className="kpi-label">Income vs Expense (Last 6 Months)</div>
            <table className="report-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expense</th>
                </tr>
              </thead>
              <tbody>
                {data.computed.income6m.map((m, i) => (
                  <tr key={i}>
                    <td>{m.month}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(m.total)}</td>
                    <td style={{ color: '#ef4444', fontWeight: 600 }}>{formatCurrency(data.computed.expenses6m[i].total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
