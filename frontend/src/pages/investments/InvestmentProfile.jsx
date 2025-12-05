import { useState, useEffect } from 'react';
import { FiUser, FiTarget, FiTrendingUp, FiShield, FiClock, FiPieChart, FiAlertCircle, FiCheckCircle, FiEdit2, FiSave } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { investmentAPI } from '../../utils/investmentAPI';

const InvestmentProfile = () => {
  const [profileData, setProfileData] = useState({
    personalInfo: {
      age: '',
      income: '',
      occupation: '',
      familySize: '',
      dependents: ''
    },
    riskProfile: {
      riskTolerance: 'moderate',
      investmentExperience: 'intermediate',
      timeHorizon: 'medium',
      financialKnowledge: 'intermediate'
    },
    financialGoals: [
      { id: 1, name: 'Emergency Fund', target: 500000, current: 200000, timeframe: '1 year', priority: 'high' },
      { id: 2, name: 'House Down Payment', target: 2000000, current: 500000, timeframe: '5 years', priority: 'medium' },
      { id: 3, name: 'Retirement', target: 10000000, current: 1000000, timeframe: '25 years', priority: 'high' }
    ],
    investmentPreferences: {
      preferredSectors: ['Technology', 'Healthcare', 'Banking'],
      assetAllocation: {
        equity: 60,
        debt: 30,
        gold: 5,
        realEstate: 5
      }
    }
  });

  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [investmentData, setInvestmentData] = useState({
    bankSchemes: [],
    goldSgb: [],
    npsPpf: [],
    mfInsuranceShares: [],
    totalPortfolio: {
      totalInvested: 0,
      currentValue: 0,
      totalReturns: 0,
      returnsPercent: 0
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllInvestmentData();
  }, []);

  const fetchAllInvestmentData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from all investment categories
      const [
        bankSchemesRes,
        goldSgbRes,
        npsPpfRes,
        mfInsuranceSharesRes
      ] = await Promise.all([
        investmentAPI.getAll('bank-schemes').catch(() => ({ data: { investments: [] } })),
        investmentAPI.getAll('gold-sgb').catch(() => ({ data: { investments: [] } })),
        investmentAPI.getAll('nps-ppf').catch(() => ({ data: { investments: [] } })),
        investmentAPI.getAll('mf-insurance-shares').catch(() => ({ data: { investments: [] } }))
      ]);

      const allInvestments = [
        ...(bankSchemesRes.data?.investments || []),
        ...(goldSgbRes.data?.investments || []),
        ...(npsPpfRes.data?.investments || []),
        ...(mfInsuranceSharesRes.data?.investments || [])
      ];

      // Calculate portfolio totals
      const totalInvested = allInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const currentValue = allInvestments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount || 0), 0);
      const totalReturns = currentValue - totalInvested;
      const returnsPercent = totalInvested > 0 ? ((totalReturns / totalInvested) * 100) : 0;

      setInvestmentData({
        bankSchemes: bankSchemesRes.data?.investments || [],
        goldSgb: goldSgbRes.data?.investments || [],
        npsPpf: npsPpfRes.data?.investments || [],
        mfInsuranceShares: mfInsuranceSharesRes.data?.investments || [],
        totalPortfolio: {
          totalInvested,
          currentValue,
          totalReturns,
          returnsPercent: returnsPercent.toFixed(2)
        }
      });

      // Update asset allocation based on actual investments
      updateActualAssetAllocation(allInvestments);

    } catch (error) {
      console.error('Error fetching investment data:', error);
      // Set demo data if API fails
      setDemoInvestmentData();
    } finally {
      setLoading(false);
    }
  };

  const updateActualAssetAllocation = (allInvestments) => {
    const categoryTotals = allInvestments.reduce((acc, inv) => {
      const category = inv.category || 'other';
      const value = inv.currentValue || inv.amount || 0;
      acc[category] = (acc[category] || 0) + value;
      return acc;
    }, {});

    const totalValue = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    if (totalValue > 0) {
      const actualAllocation = {
        equity: 0,
        debt: 0,
        gold: 0,
        realEstate: 0
      };

      // Map categories to asset classes
      Object.entries(categoryTotals).forEach(([category, value]) => {
        const percentage = (value / totalValue) * 100;
        
        if (category.includes('mf') || category.includes('shares') || category.includes('insurance')) {
          actualAllocation.equity += percentage;
        } else if (category.includes('bank') || category.includes('nps') || category.includes('ppf') || category.includes('fd') || category.includes('rd')) {
          actualAllocation.debt += percentage;
        } else if (category.includes('gold') || category.includes('sgb')) {
          actualAllocation.gold += percentage;
        } else if (category.includes('real') || category.includes('property')) {
          actualAllocation.realEstate += percentage;
        }
      });

      setProfileData(prev => ({
        ...prev,
        investmentPreferences: {
          ...prev.investmentPreferences,
          assetAllocation: actualAllocation
        }
      }));
    }
  };

  const setDemoInvestmentData = () => {
    const demoData = {
      bankSchemes: [
        { _id: 'demo-1', category: 'bank-schemes', type: 'Fixed Deposit', amount: 200000, currentValue: 212000 },
        { _id: 'demo-2', category: 'bank-schemes', type: 'Recurring Deposit', amount: 50000, currentValue: 52000 }
      ],
      goldSgb: [
        { _id: 'demo-3', category: 'gold-sgb', type: 'Gold', amount: 100000, currentValue: 115000 },
        { _id: 'demo-4', category: 'gold-sgb', type: 'SGB', amount: 50000, currentValue: 58000 }
      ],
      npsPpf: [
        { _id: 'demo-5', category: 'nps-ppf', type: 'NPS', amount: 150000, currentValue: 165000 },
        { _id: 'demo-6', category: 'nps-ppf', type: 'PPF', amount: 100000, currentValue: 112000 }
      ],
      mfInsuranceShares: [
        { _id: 'demo-7', category: 'mf-insurance-shares', type: 'Mutual Fund', amount: 200000, currentValue: 235000 },
        { _id: 'demo-8', category: 'mf-insurance-shares', type: 'Shares', amount: 80000, currentValue: 92000 }
      ]
    };

    const allInvestments = Object.values(demoData).flat();
    const totalInvested = allInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const currentValue = allInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturns = currentValue - totalInvested;
    const returnsPercent = ((totalReturns / totalInvested) * 100).toFixed(2);

    setInvestmentData({
      ...demoData,
      totalPortfolio: { totalInvested, currentValue, totalReturns, returnsPercent }
    });

    updateActualAssetAllocation(allInvestments);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const riskLevels = {
    conservative: { score: 20, description: 'Low risk, stable returns' },
    'moderate-conservative': { score: 40, description: 'Balanced with slight risk aversion' },
    moderate: { score: 60, description: 'Balanced risk-return approach' },
    'moderate-aggressive': { score: 80, description: 'Growth-oriented with calculated risk' },
    aggressive: { score: 100, description: 'High risk for high returns' }
  };

  const getProfileScore = () => {
    const riskScore = riskLevels[profileData.riskProfile.riskTolerance].score;
    const experienceScore = profileData.riskProfile.investmentExperience === 'beginner' ? 20 : 
                           profileData.riskProfile.investmentExperience === 'intermediate' ? 50 : 80;
    const timeScore = profileData.riskProfile.timeHorizon === 'short' ? 20 : 
                     profileData.riskProfile.timeHorizon === 'medium' ? 50 : 80;
    
    // Add portfolio diversification score
    const diversificationScore = calculateDiversificationScore();
    
    return Math.round((riskScore + experienceScore + timeScore + diversificationScore) / 4);
  };

  const calculateDiversificationScore = () => {
    const allocation = profileData.investmentPreferences.assetAllocation;
    const activeCategories = Object.values(allocation).filter(val => val > 0).length;
    
    // Score based on how well diversified the portfolio is
    if (activeCategories >= 4) return 80;
    if (activeCategories === 3) return 60;
    if (activeCategories === 2) return 40;
    return 20;
  };

  const getInvestmentRecommendations = () => {
    const recommendations = [];
    const portfolio = investmentData.totalPortfolio;
    const allocation = profileData.investmentPreferences.assetAllocation;
    
    // Portfolio performance recommendations
    if (parseFloat(portfolio.returnsPercent) < 5) {
      recommendations.push("Consider reviewing underperforming investments");
    }
    
    // Diversification recommendations
    if (allocation.equity > 80) {
      recommendations.push("High equity exposure - consider increasing debt allocation for stability");
    } else if (allocation.equity < 20) {
      recommendations.push("Low equity exposure - consider increasing equity for better long-term returns");
    }
    
    // Risk-based recommendations
    if (profileData.riskProfile.riskTolerance === 'conservative' && allocation.equity > 40) {
      recommendations.push("Risk profile suggests conservative approach - reduce equity allocation");
    } else if (profileData.riskProfile.riskTolerance === 'aggressive' && allocation.equity < 60) {
      recommendations.push("Risk profile suggests aggressive approach - increase equity allocation");
    }
    
    // Goal-based recommendations
    const highPriorityGoals = profileData.financialGoals.filter(goal => goal.priority === 'high');
    highPriorityGoals.forEach(goal => {
      const progress = (goal.current / goal.target) * 100;
      if (progress < 25 && goal.timeframe.includes('year')) {
        recommendations.push(`Increase savings for ${goal.name} - only ${progress.toFixed(0)}% achieved`);
      }
    });
    
    return recommendations;
  };

  const getAssetAllocationData = () => {
    return Object.entries(profileData.investmentPreferences.assetAllocation).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }));
  };

  const getGoalsProgress = () => {
    return profileData.financialGoals.map(goal => ({
      name: goal.name,
      progress: Math.round((goal.current / goal.target) * 100),
      target: goal.target,
      current: goal.current
    }));
  };

  const getRiskProfileData = () => {
    return [
      { subject: 'Risk Tolerance', A: riskLevels[profileData.riskProfile.riskTolerance].score, fullMark: 100 },
      { subject: 'Experience', A: profileData.riskProfile.investmentExperience === 'beginner' ? 20 : 
             profileData.riskProfile.investmentExperience === 'intermediate' ? 50 : 80, fullMark: 100 },
      { subject: 'Time Horizon', A: profileData.riskProfile.timeHorizon === 'short' ? 20 : 
             profileData.riskProfile.timeHorizon === 'medium' ? 50 : 80, fullMark: 100 },
      { subject: 'Knowledge', A: profileData.riskProfile.financialKnowledge === 'basic' ? 20 : 
             profileData.riskProfile.financialKnowledge === 'intermediate' ? 50 : 80, fullMark: 100 }
    ];
  };

  const handleSave = () => {
    setEditMode(false);
    // Here you would typically save to backend
    console.log('Profile saved:', profileData);
  };

  const profileScore = getProfileScore();
  const assetData = getAssetAllocationData();
  const goalsData = getGoalsProgress();
  const radarData = getRiskProfileData();

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Investment Profile</h1>
        <div className="header-actions">
          {!editMode ? (
            <button className="btn-primary" onClick={() => setEditMode(true)}>
              <FiEdit2 /> Edit Profile
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSave}>
              <FiSave /> Save Profile
            </button>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiPieChart /> Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          <FiShield /> Risk Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <FiTarget /> Financial Goals
        </button>
        <button 
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <FiTrendingUp /> Preferences
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="profile-overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}>
                <FiUser />
              </div>
              <div className="stat-content">
                <p className="stat-label">Portfolio Value</p>
                <h3 className="stat-value">{profileScore}/100</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                <FiTarget />
              </div>
              <div className="stat-content">
                <p className="stat-label">Active Goals</p>
                <h3 className="stat-value">{profileData.financialGoals.length}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
                <FiShield />
              </div>
              <div className="stat-content">
                <p className="stat-label">Risk Level</p>
                <h3 className="stat-value">{profileData.riskProfile.riskTolerance}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' }}>
                <FiClock />
              </div>
              <div className="stat-content">
                <p className="stat-label">Time Horizon</p>
                <h3 className="stat-value">{profileData.riskProfile.timeHorizon}</h3>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card premium">
              <div className="chart-header">
                <div className="chart-title">
                  <FiPieChart className="chart-icon" />
                  <h3>Asset Allocation</h3>
                </div>
                <div className="chart-subtitle">Recommended distribution</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {assetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card premium">
              <div className="chart-header">
                <div className="chart-title">
                  <FiTarget className="chart-icon" />
                  <h3>Goals Progress</h3>
                </div>
                <div className="chart-subtitle">Achievement status</div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={goalsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                    <Bar dataKey="progress" fill="#10B981" name="Progress %" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="profile-summary">
            <h3>Profile Summary</h3>
            <div className="summary-content">
              <p>Based on your risk profile and financial goals, you have a <strong>{profileData.riskProfile.riskTolerance}</strong> investment approach with a <strong>{profileData.riskProfile.timeHorizon}</strong> time horizon.</p>
              <p>Your current asset allocation suggests a balanced approach with emphasis on <strong>{Math.max(...Object.values(profileData.investmentPreferences.assetAllocation))}% in {Object.keys(profileData.investmentPreferences.assetAllocation).find(key => profileData.investmentPreferences.assetAllocation[key] === Math.max(...Object.values(profileData.investmentPreferences.assetAllocation)))}</strong>.</p>
              <div className="recommendations">
                <h4><FiAlertCircle /> Key Recommendations</h4>
                <ul>
                  <li>Maintain emergency fund of 6 months expenses</li>
                  <li>Consider increasing equity allocation for long-term goals</li>
                  <li>Review portfolio performance quarterly</li>
                  <li>Diversify across different sectors and asset classes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="risk-profile-section">
          <div className="chart-card premium">
            <div className="chart-header">
              <div className="chart-title">
                <FiShield className="chart-icon" />
                <h3>Risk Assessment</h3>
              </div>
              <div className="chart-subtitle">Your risk profile analysis</div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: '500', fill: '#64748b' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar name="Risk Profile" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="risk-details">
            <h3>Risk Profile Details</h3>
            <div className="risk-grid">
              <div className="risk-item">
                <label>Risk Tolerance</label>
                <select 
                  value={profileData.riskProfile.riskTolerance}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    riskProfile: { ...profileData.riskProfile, riskTolerance: e.target.value }
                  })}
                  disabled={!editMode}
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate-conservative">Moderate-Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="moderate-aggressive">Moderate-Aggressive</option>
                  <option value="aggressive">Aggressive</option>
                </select>
                <p>{riskLevels[profileData.riskProfile.riskTolerance].description}</p>
              </div>

              <div className="risk-item">
                <label>Investment Experience</label>
                <select 
                  value={profileData.riskProfile.investmentExperience}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    riskProfile: { ...profileData.riskProfile, investmentExperience: e.target.value }
                  })}
                  disabled={!editMode}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="risk-item">
                <label>Time Horizon</label>
                <select 
                  value={profileData.riskProfile.timeHorizon}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    riskProfile: { ...profileData.riskProfile, timeHorizon: e.target.value }
                  })}
                  disabled={!editMode}
                >
                  <option value="short">Short Term (&lt;3 years)</option>
                  <option value="medium">Medium Term (3-10 years)</option>
                  <option value="long">Long Term (&gt;10 years)</option>
                </select>
              </div>

              <div className="risk-item">
                <label>Financial Knowledge</label>
                <select 
                  value={profileData.riskProfile.financialKnowledge}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    riskProfile: { ...profileData.riskProfile, financialKnowledge: e.target.value }
                  })}
                  disabled={!editMode}
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="goals-section">
          <h3>Financial Goals</h3>
          <div className="goals-grid">
            {profileData.financialGoals.map((goal) => (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <h4>{goal.name}</h4>
                  <span className={`priority-badge ${goal.priority}`}>{goal.priority}</span>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(goal.current / goal.target) * 100}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    ₹{goal.current.toLocaleString('en-IN')} / ₹{goal.target.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="goal-details">
                  <p><FiClock /> {goal.timeframe}</p>
                  <p><FiTarget /> {Math.round((goal.current / goal.target) * 100)}% achieved</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="preferences-section">
          <h3>Investment Preferences</h3>
          
          <div className="preference-group">
            <h4>Asset Allocation</h4>
            <div className="allocation-sliders">
              {Object.entries(profileData.investmentPreferences.assetAllocation).map(([asset, percentage]) => (
                <div key={asset} className="slider-item">
                  <label>{asset.charAt(0).toUpperCase() + asset.slice(1)}: {percentage}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      investmentPreferences: {
                        ...profileData.investmentPreferences,
                        assetAllocation: {
                          ...profileData.investmentPreferences.assetAllocation,
                          [asset]: parseInt(e.target.value)
                        }
                      }
                    })}
                    disabled={!editMode}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <h4>Preferred Sectors</h4>
            <div className="sectors-grid">
              {['Technology', 'Healthcare', 'Banking', 'Energy', 'Consumer Goods', 'Real Estate'].map(sector => (
                <label key={sector} className="sector-checkbox">
                  <input
                    type="checkbox"
                    checked={profileData.investmentPreferences.preferredSectors.includes(sector)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProfileData({
                          ...profileData,
                          investmentPreferences: {
                            ...profileData.investmentPreferences,
                            preferredSectors: [...profileData.investmentPreferences.preferredSectors, sector]
                          }
                        });
                      } else {
                        setProfileData({
                          ...profileData,
                          investmentPreferences: {
                            ...profileData.investmentPreferences,
                            preferredSectors: profileData.investmentPreferences.preferredSectors.filter(s => s !== sector)
                          }
                        });
                      }
                    }}
                    disabled={!editMode}
                  />
                  <span>{sector}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentProfile;
