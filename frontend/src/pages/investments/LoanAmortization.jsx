import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiBarChart2, FiPieChart, FiDollarSign, FiTrendingUp, FiActivity, FiCreditCard } from 'react-icons/fi';
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { investmentAPI } from '../../utils/investmentAPI';
import './Investment.css';

const LoanAmortization = () => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const [inputs, setInputs] = useState({
    name: 'Home Loan',
    principal: 2500000,
    annualRate: 8.5,
    tenureYears: 20,
    startDate: new Date().toISOString().slice(0, 10),
    extraPayment: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm]);

  const schedule = useMemo(() => {
    const n = inputs.tenureYears * 12;
    const r = inputs.annualRate / 100 / 12;
    const emi = r === 0 ? inputs.principal / n : inputs.principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const rows = [];
    let balance = inputs.principal;
    let totalInterest = 0;
    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      let principalPaid = emi - interest + inputs.extraPayment;
      if (principalPaid > balance) principalPaid = balance;
      balance = balance - principalPaid;
      totalInterest += interest;
      rows.push({ month: m, emi, interest, principal: principalPaid, balance });
      if (balance <= 0) break;
    }
    const maturity = new Date(inputs.startDate);
    maturity.setMonth(maturity.getMonth() + rows.length);
    return { rows, emi, totalInterest, totalPaid: rows.reduce((s, r) => s + r.emi + inputs.extraPayment, 0), maturity };
  }, [inputs]);

  const areaData = useMemo(() => schedule.rows.filter((r) => r.month % 6 === 0 || r.month === 1).map((r) => ({ name: `M${r.month}`, value: r.balance })), [schedule]);
  const barData = useMemo(() => schedule.rows.slice(0, 12).map((r) => ({ name: `M${r.month}`, interest: r.interest, principal: r.principal })), [schedule]);
  const pieData = useMemo(() => ([{ name: 'Interest', value: Math.round(schedule.totalInterest) }, { name: 'Principal', value: Math.round(inputs.principal) }]), [schedule, inputs]);

  const COLORS = ['#EF4444', '#2563EB', '#10B981', '#8B5CF6'];

  const handleSaveLoan = async () => {
    try {
      setSaving(true);
      const payload = {
        category: 'loan-amortization',
        type: 'Loan',
        name: inputs.name,
        amount: inputs.principal,
        interestRate: inputs.annualRate,
        startDate: inputs.startDate,
        maturityDate: schedule.maturity.toISOString().slice(0, 10),
        frequency: 'monthly',
        notes: JSON.stringify({ extraPayment: inputs.extraPayment, tenureYears: inputs.tenureYears }),
      };
      await investmentAPI.create(payload);
      alert('Loan saved');
    } catch (e) {
      alert(e.response?.data?.message || 'Error saving loan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Loan Amortization</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Open Calculator'}
          </button>
          <button className="btn-secondary" onClick={handleSaveLoan} disabled={saving}>
            {saving ? 'Saving...' : 'Save Loan'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiCreditCard />
          </div>
          <div className="stat-content">
            <p className="stat-label">EMI</p>
            <h3 className="stat-value">₹{Math.round(schedule.emi).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiActivity />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Interest</p>
            <h3 className="stat-value">₹{Math.round(schedule.totalInterest).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Paid</p>
            <h3 className="stat-value">₹{Math.round(schedule.totalPaid).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Months</p>
            <h3 className="stat-value">{schedule.rows.length}</h3>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="charts-header">
          <h2>Loan Analytics</h2>
          <p>Balance trajectory and interest vs principal</p>
        </div>
        <div className="charts-grid">
          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Balance Over Time</h3>
              </div>
              <div className="chart-subtitle">Every 6 months</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={areaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="loanArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, 'Balance']} />
                  <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} fill="url(#loanArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiPieChart className="chart-icon" />
                <h3>Interest vs Principal</h3>
              </div>
              <div className="chart-subtitle">Total breakdown</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <RPieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${Math.round(value).toLocaleString('en-IN')}`, 'Value']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </RPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>First Year Breakdown</h3>
              </div>
              <div className="chart-subtitle">Monthly principal vs interest</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, '']} />
                  <Legend />
                  <Bar dataKey="interest" fill="#EF4444" name="Interest" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="principal" fill="#10B981" name="Principal" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>Loan Calculator</h2>
          <form className="investment-form">
            <div className="form-row">
              <div className="form-field">
                <label>Loan Name *</label>
                <input type="text" value={inputs.name} onChange={(e) => setInputs({ ...inputs, name: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Principal (₹) *</label>
                <input type="number" value={inputs.principal} onChange={(e) => setInputs({ ...inputs, principal: Number(e.target.value) })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Annual Rate (%) *</label>
                <input type="number" step="0.01" value={inputs.annualRate} onChange={(e) => setInputs({ ...inputs, annualRate: Number(e.target.value) })} required />
              </div>
              <div className="form-field">
                <label>Tenure (Years) *</label>
                <input type="number" value={inputs.tenureYears} onChange={(e) => setInputs({ ...inputs, tenureYears: Number(e.target.value) })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Start Date *</label>
                <input type="date" value={inputs.startDate} onChange={(e) => setInputs({ ...inputs, startDate: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Extra Monthly Payment</label>
                <input type="number" value={inputs.extraPayment} onChange={(e) => setInputs({ ...inputs, extraPayment: Number(e.target.value) })} />
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoanAmortization;
