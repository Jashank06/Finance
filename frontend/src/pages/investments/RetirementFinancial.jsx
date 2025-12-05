import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiBarChart2, FiPieChart, FiDollarSign, FiTrendingUp, FiActivity, FiSun } from 'react-icons/fi';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { investmentAPI } from '../../utils/investmentAPI';
import './Investment.css';

const RetirementFinancial = () => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const [inputs, setInputs] = useState({
    currentAge: 35,
    retirementAge: 60,
    lifeExpectancy: 85,
    currentCorpus: 500000,
    monthlySavings: 20000,
    expectedReturnPre: 10,
    expectedReturnPost: 6,
    inflation: 6,
    monthlyExpenseToday: 50000,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm]);

  const yearsToRetire = useMemo(() => Math.max(0, inputs.retirementAge - inputs.currentAge), [inputs]);
  const yearsPost = useMemo(() => Math.max(0, inputs.lifeExpectancy - inputs.retirementAge), [inputs]);
  const realPre = useMemo(() => ((1 + inputs.expectedReturnPre / 100) / (1 + inputs.inflation / 100)) - 1, [inputs]);
  const realPost = useMemo(() => ((1 + inputs.expectedReturnPost / 100) / (1 + inputs.inflation / 100)) - 1, [inputs]);

  const projection = useMemo(() => {
    const months = yearsToRetire * 12;
    const r = realPre / 12;
    const corpusStart = inputs.currentCorpus;
    const pmt = inputs.monthlySavings;
    let corpus = corpusStart;
    const points = [];
    for (let m = 1; m <= months; m++) {
      corpus = corpus * (1 + r) + pmt;
      if (m % 12 === 0) {
        points.push({ year: Math.floor(m / 12), value: corpus });
      }
    }
    return { months, r, corpusAtRetire: corpus, points };
  }, [inputs, yearsToRetire, realPre]);

  const requiredCorpus = useMemo(() => {
    const expAtRetire = inputs.monthlyExpenseToday * Math.pow(1 + inputs.inflation / 100, yearsToRetire);
    const n = yearsPost * 12;
    const r = realPost / 12;
    if (r <= 0) return expAtRetire * n;
    return expAtRetire * (1 - Math.pow(1 + r, -n)) / r;
  }, [inputs, yearsToRetire, yearsPost, realPost]);

  const gap = useMemo(() => (projection.corpusAtRetire - requiredCorpus), [projection, requiredCorpus]);

  const pieData = useMemo(() => ([
    { name: 'Projected Corpus', value: Math.max(0, projection.corpusAtRetire) },
    { name: 'Required Corpus', value: Math.max(0, requiredCorpus) },
  ]), [projection, requiredCorpus]);

  const barData = useMemo(() => ([
    { name: 'Totals', invested: inputs.currentCorpus + inputs.monthlySavings * projection.months, current: projection.corpusAtRetire },
  ]), [inputs, projection]);

  const COLORS = ['#10B981', '#EF4444', '#2563EB', '#8B5CF6'];

  const handleSavePlan = async () => {
    try {
      setSaving(true);
      const payload = {
        category: 'retirement',
        type: 'Retirement Plan',
        name: `Retirement Plan (${new Date().toLocaleDateString('en-IN')})`,
        amount: projection.corpusAtRetire,
        startDate: new Date().toISOString().slice(0, 10),
        notes: JSON.stringify(inputs),
      };
      await investmentAPI.create(payload);
      alert('Retirement plan saved');
    } catch (e) {
      alert(e.response?.data?.message || 'Error saving plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Retirement Financial Planning</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Open Calculator'}
          </button>
          <button className="btn-secondary" onClick={handleSavePlan} disabled={saving}>
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Projected Corpus</p>
            <h3 className="stat-value">₹{Math.round(projection.corpusAtRetire).toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiActivity />
          </div>
          <div className="stat-content">
            <p className="stat-label">Required Corpus</p>
            <h3 className="stat-value">₹{Math.round(requiredCorpus).toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Gap</p>
            <h3 className="stat-value" style={{ color: gap >= 0 ? '#10B981' : '#EF4444' }}>₹{Math.round(gap).toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <FiSun />
          </div>
          <div className="stat-content">
            <p className="stat-label">Years to Retire</p>
            <h3 className="stat-value">{yearsToRetire}</h3>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="charts-header">
          <h2>Retirement Analytics</h2>
          <p>Projection and requirement comparison</p>
        </div>

        <div className="charts-grid">
          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Corpus Projection</h3>
              </div>
              <div className="chart-subtitle">Growth till retirement</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={projection.points} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, 'Corpus']} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fill="url(#areaGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiPieChart className="chart-icon" />
                <h3>Projected vs Required</h3>
              </div>
              <div className="chart-subtitle">Corpus comparison</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${Math.round(value).toLocaleString('en-IN')}`, 'Value']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Totals Overview</h3>
              </div>
              <div className="chart-subtitle">Invested vs projected</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, '']} />
                  <Legend />
                  <Bar dataKey="invested" fill="#2563EB" name="Invested" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="current" fill="#10B981" name="Projected" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>Retirement Calculator</h2>
          <form className="investment-form">
            <div className="form-row">
              <div className="form-field">
                <label>Current Age *</label>
                <input type="number" value={inputs.currentAge} onChange={(e) => setInputs({ ...inputs, currentAge: Number(e.target.value) })} required />
              </div>
              <div className="form-field">
                <label>Retirement Age *</label>
                <input type="number" value={inputs.retirementAge} onChange={(e) => setInputs({ ...inputs, retirementAge: Number(e.target.value) })} required />
              </div>
              <div className="form-field">
                <label>Life Expectancy *</label>
                <input type="number" value={inputs.lifeExpectancy} onChange={(e) => setInputs({ ...inputs, lifeExpectancy: Number(e.target.value) })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Current Corpus (₹)</label>
                <input type="number" value={inputs.currentCorpus} onChange={(e) => setInputs({ ...inputs, currentCorpus: Number(e.target.value) })} />
              </div>
              <div className="form-field">
                <label>Monthly Savings (₹)</label>
                <input type="number" value={inputs.monthlySavings} onChange={(e) => setInputs({ ...inputs, monthlySavings: Number(e.target.value) })} />
              </div>
              <div className="form-field">
                <label>Monthly Expense Today (₹)</label>
                <input type="number" value={inputs.monthlyExpenseToday} onChange={(e) => setInputs({ ...inputs, monthlyExpenseToday: Number(e.target.value) })} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Expected Return (Pre-retirement) %</label>
                <input type="number" step="0.01" value={inputs.expectedReturnPre} onChange={(e) => setInputs({ ...inputs, expectedReturnPre: Number(e.target.value) })} />
              </div>
              <div className="form-field">
                <label>Expected Return (Post-retirement) %</label>
                <input type="number" step="0.01" value={inputs.expectedReturnPost} onChange={(e) => setInputs({ ...inputs, expectedReturnPost: Number(e.target.value) })} />
              </div>
              <div className="form-field">
                <label>Inflation %</label>
                <input type="number" step="0.01" value={inputs.inflation} onChange={(e) => setInputs({ ...inputs, inflation: Number(e.target.value) })} />
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RetirementFinancial;
