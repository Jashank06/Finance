import { useEffect, useMemo, useRef, useState } from 'react';
import { FiBarChart2, FiDownload, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { AreaChart, Area, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import './RetirementFinancial.css';

const RetirementFinancial = () => {
  const formRef = useRef(null);
  const [inputs, setInputs] = useState({
    currentAge: 50,
    annualIncome: 120000,
    inflation: 5,
    balance: 1000000,
    annualSavings: 0,
    savingsIncrease: 0,
    investmentReturn: 6.25,
    pension: 0,
    pensionIncrease: 0,
    retirementAge: 65,
    retirementYears: 20,
    incomeReplacement: 75,
    retUncertainty: 2,
    savingsUncertainty: 0,
    savingsIncUncertainty: 0,
    pensionUncertainty: 0,
    pensionIncUncertainty: 0,
    capAge: 79,
  });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [show]);

  const formatINR = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const computePlan = useMemo(() => {
    const startAge = inputs.currentAge;
    const endAge = Math.min(inputs.retirementAge + inputs.retirementYears, inputs.capAge);
    let salary = inputs.annualIncome;
    let savings = inputs.annualSavings;
    let balance = inputs.balance;
    const rows = [];
    const retBaseSalary = inputs.annualIncome * Math.pow(1 + inputs.inflation / 100, inputs.retirementAge - inputs.currentAge);
    let need = retBaseSalary * (inputs.incomeReplacement / 100);
    let pension = inputs.pension;
    
    for (let age = startAge; age <= endAge; age++) {
      const startBalance = balance;
      const interest = startBalance * (inputs.investmentReturn / 100);
      let flow = 0;
      
      if (age < inputs.retirementAge) {
        flow = savings;
      } else {
        flow = -(need - pension);
        need = need * (1 + inputs.inflation / 100);
        pension = pension * (1 + inputs.pensionIncrease / 100);
      }
      
      balance = startBalance + interest + flow;
      rows.push({ 
        age, 
        salary: age < inputs.retirementAge ? salary : 0, 
        startBalance, 
        interest, 
        flow, 
        endBalance: balance 
      });
      
      if (age < inputs.retirementAge) {
        salary = salary * (1 + inputs.inflation / 100);
        savings = savings * (1 + inputs.savingsIncrease / 100);
      }
    }
    
    const fundedThrough = rows.reduce((acc, r) => (r.endBalance >= 0 ? r.age : acc), startAge - 1);
    const finalBalance = balance;
    const peakBalance = Math.max(...rows.map(r => r.endBalance));
    const retirementBalance = rows.find(r => r.age === inputs.retirementAge)?.endBalance || 0;
    
    return { rows, fundedThrough, finalBalance, endAge, peakBalance, retirementBalance };
  }, [inputs]);

  const handleReset = () => {
    setInputs({
      currentAge: 50,
      annualIncome: 120000,
      inflation: 5,
      balance: 1000000,
      annualSavings: 0,
      savingsIncrease: 0,
      investmentReturn: 6.25,
      pension: 0,
      pensionIncrease: 0,
      retirementAge: 65,
      retirementYears: 20,
      incomeReplacement: 75,
      retUncertainty: 2,
      savingsUncertainty: 0,
      savingsIncUncertainty: 0,
      pensionUncertainty: 0,
      pensionIncUncertainty: 0,
      capAge: 79,
    });
    setShow(false);
  };

  const handleExport = () => {
    const headers = ['Age', 'Salary', 'Start Balance', 'Interest', 'Savings/Withdrawals', 'Year End Balance'];
    const csvData = [
      headers.join(','),
      ...computePlan.rows.map(r => 
        [r.age, r.salary, r.startBalance, r.interest, r.flow, r.endBalance].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retirement-plan.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isFunded = computePlan.fundedThrough >= computePlan.endAge;

  return (
    <div className="retirement-container">
      <div className="retirement-header">
        <h1>Retirement Planner</h1>
        <div className="header-actions">
          <button className="btn-secondary-action" onClick={handleReset}>
            <FiRefreshCw /> Reset
          </button>
        </div>
      </div>

      <div className="retirement-form-card">
        <h2>Input</h2>
        <div className="retirement-form-grid">
          <div className="form-section">
            <h3 className="section-title">Now</h3>
            <div className="form-fields">
              <div className="form-field"><label>Your current age</label><input type="number" value={inputs.currentAge} onChange={(e) => setInputs({ ...inputs, currentAge: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Annual income (₹)</label><input type="number" value={inputs.annualIncome} onChange={(e) => setInputs({ ...inputs, annualIncome: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Annual inflation & income increases (%)</label><input type="number" step="0.01" value={inputs.inflation} onChange={(e) => setInputs({ ...inputs, inflation: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Retirement savings balance (₹)</label><input type="number" value={inputs.balance} onChange={(e) => setInputs({ ...inputs, balance: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Annual savings amount (₹)</label><input type="number" value={inputs.annualSavings} onChange={(e) => setInputs({ ...inputs, annualSavings: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Annual savings increases (%)</label><input type="number" step="0.01" value={inputs.savingsIncrease} onChange={(e) => setInputs({ ...inputs, savingsIncrease: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Investment return (%)</label><input type="number" step="0.01" value={inputs.investmentReturn} onChange={(e) => setInputs({ ...inputs, investmentReturn: Number(e.target.value) })} /></div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">At Retirement</h3>
            <div className="form-fields">
              <div className="form-field"><label>Annual pension benefit (₹)</label><input type="number" value={inputs.pension} onChange={(e) => setInputs({ ...inputs, pension: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Annual pension benefit increases (%)</label><input type="number" step="0.01" value={inputs.pensionIncrease} onChange={(e) => setInputs({ ...inputs, pensionIncrease: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Desired retirement age</label><input type="number" value={inputs.retirementAge} onChange={(e) => setInputs({ ...inputs, retirementAge: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Number of years of retirement income</label><input type="number" value={inputs.retirementYears} onChange={(e) => setInputs({ ...inputs, retirementYears: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Income replacement (%)</label><input type="number" step="0.01" value={inputs.incomeReplacement} onChange={(e) => setInputs({ ...inputs, incomeReplacement: Number(e.target.value) })} /></div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Uncertainty (%)</h3>
            <div className="form-fields">
              <div className="form-field"><label>Investment return uncertainty</label><input type="number" step="0.01" value={inputs.retUncertainty} onChange={(e) => setInputs({ ...inputs, retUncertainty: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Annual savings amount uncertainty</label><input type="number" step="0.01" value={inputs.savingsUncertainty} onChange={(e) => setInputs({ ...inputs, savingsUncertainty: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Annual savings increases uncertainty</label><input type="number" step="0.01" value={inputs.savingsIncUncertainty} onChange={(e) => setInputs({ ...inputs, savingsIncUncertainty: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Annual pension benefit amount uncertainty</label><input type="number" step="0.01" value={inputs.pensionUncertainty} onChange={(e) => setInputs({ ...inputs, pensionUncertainty: Number(e.target.value) })} /></div>
              <div className="form-field"><label>Annual Pension benefit increases uncertainty</label><input type="number" step="0.01" value={inputs.pensionIncUncertainty} onChange={(e) => setInputs({ ...inputs, pensionIncUncertainty: Number(e.target.value) })} /></div>
            </div>
          </div>
        </div>

        <div className="form-submit">
          <button className="btn-show-plan" onClick={() => setShow(true)}>
            Show My Plan
          </button>
        </div>
      </div>

      {show && (
        <div className="results-section" ref={formRef}>
          {/* Key Statistics */}
          <div className="stats-grid">
            <div className="stat-card green">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
                <FiTrendingUp />
              </div>
              <div className="stat-content">
                <p className="stat-label">Peak Balance</p>
                <h3 className="stat-value">{formatINR(computePlan.peakBalance)}</h3>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
                <FiBarChart2 />
              </div>
              <div className="stat-content">
                <p className="stat-label">Balance at Retirement</p>
                <h3 className="stat-value">{formatINR(computePlan.retirementBalance)}</h3>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
                <FiBarChart2 />
              </div>
              <div className="stat-content">
                <p className="stat-label">Funded Through Age</p>
                <h3 className="stat-value">{computePlan.fundedThrough}</h3>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className={`message-card ${isFunded ? 'success' : 'warning'}`}>
            <h3>
              {isFunded 
                ? `Congratulations! Your plan is funded through age ${computePlan.fundedThrough} with an estimated surplus.` 
                : `Warning! Your plan runs out of funds at age ${computePlan.fundedThrough}.`}
            </h3>
            <p className="message-subtitle">
              Estimated Money Left Over: <strong>{formatINR(computePlan.finalBalance)}</strong>
            </p>
            <p className="message-note">
              Note: Your plan extends beyond age {inputs.capAge}. The projection has been capped at age {inputs.capAge} as requested.
            </p>
          </div>

          {/* Chart */}
          <div className="chart-card retirement-chart">
            <div className="chart-header">
              <div className="chart-title">
                <FiBarChart2 className="chart-icon" />
                <h3>Savings Balance Over Time</h3>
              </div>
              <button className="btn-export" onClick={handleExport}>
                <FiDownload /> Export Data
              </button>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={computePlan.rows} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="age" 
                    tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }}
                    label={{ value: 'Age', position: 'insideBottom', offset: -10, style: { fontSize: 14, fontWeight: '600', fill: '#334155' } }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} 
                    tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`}
                    label={{ value: 'Balance', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: '600', fill: '#334155' } }}
                  />
                  <Tooltip 
                    formatter={(v, n) => [`${formatINR(v)}`, n === 'endBalance' ? 'Savings Balance' : n]} 
                    labelFormatter={(l) => `Age ${l}`}
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px', 
                      padding: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="endBalance" 
                    stroke="#16a34a" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorBalance)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="retirement-table-card">
            <div className="table-header">
              <h2>Chart Details</h2>
            </div>
            <div className="table-scroll">
              <table className="retirement-table">
                <thead>
                  <tr>
                    <th>Age</th>
                    <th>Salary</th>
                    <th>Start Balance</th>
                    <th>Interest</th>
                    <th>Savings/Withdrawals</th>
                    <th>Year End Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {computePlan.rows.map((r, idx) => (
                    <tr 
                      key={`row-${idx}`} 
                      className={r.age === inputs.retirementAge ? 'retirement-row' : ''}
                    >
                      <td><strong>{r.age}</strong></td>
                      <td>{r.salary ? formatINR(r.salary) : '₹0'}</td>
                      <td>{formatINR(r.startBalance)}</td>
                      <td>{formatINR(r.interest)}</td>
                      <td className={r.flow < 0 ? 'negative' : 'positive'}>
                        {r.flow < 0 ? `₹0` : formatINR(r.flow)}
                      </td>
                      <td><strong>{formatINR(r.endBalance)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetirementFinancial;
