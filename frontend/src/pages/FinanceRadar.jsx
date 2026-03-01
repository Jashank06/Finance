import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../utils/api';
import './FinanceRadar.css';

const fmt = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div style={{ background: 'rgba(10,15,30,0.97)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 10, padding: '0.6rem 0.9rem', fontSize: '0.82rem', color: '#e2e8f0' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
                {payload.map((p, i) => (
                    <div key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</div>
                ))}
            </div>
        );
    }
    return null;
};

export default function FinanceRadar() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/radar/anomalies');
            setData(res.data.data);
        } catch (e) {
            setError('Could not run Finance Radar. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="radar-page">
                <div className="radar-loading">
                    <div className="radar-loading-anim">
                        <div className="radar-loading-ring" />
                    </div>
                    <p>Scanning your finances for anomalies...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="radar-page">
                <div className="radar-loading">
                    <p style={{ color: '#f87171' }}>{error || 'No data found.'}</p>
                    <button onClick={fetchData} style={{ marginTop: 12, padding: '0.5rem 1.2rem', borderRadius: 8, background: '#fb923c', color: '#fff', border: 'none', cursor: 'pointer' }}>Retry Scan</button>
                </div>
            </div>
        );
    }

    const { anomalies = [], totalAnomalies, totalExcessSpend, categoryComparison = [], subscriptions = [], summary = {} } = data;

    return (
        <div className="radar-page">
            {/* Header */}
            <div className="radar-header">
                <h1>📡 Finance Radar</h1>
                <p>AI-powered spending anomaly detector — scanning your financial patterns</p>
            </div>

            {/* Radar Animation */}
            <div className="radar-scan-wrapper">
                <div className="radar-scan">
                    <div className="radar-circle" />
                    <div className="radar-circle" />
                    <div className="radar-circle" />
                    <div className="radar-sweep" />
                    <div className="radar-dot-center" />
                    {/* Simulated data blips */}
                    <div className="radar-blip-particle" />
                    <div className="radar-blip-particle" />
                </div>
            </div>

            {/* Summary Strip */}
            <div className="radar-summary">
                <div className="radar-stat">
                    <div className="radar-stat-emoji">🔴</div>
                    <div className="radar-stat-label">Critical Alerts</div>
                    <div className={`radar-stat-value ${summary.criticalAlerts > 0 ? 'red' : 'green'}`}>{summary.criticalAlerts || 0}</div>
                </div>
                <div className="radar-stat">
                    <div className="radar-stat-emoji">🟡</div>
                    <div className="radar-stat-label">Warning Alerts</div>
                    <div className={`radar-stat-value ${summary.warningAlerts > 0 ? 'yellow' : 'green'}`}>{summary.warningAlerts || 0}</div>
                </div>
                <div className="radar-stat">
                    <div className="radar-stat-emoji">💸</div>
                    <div className="radar-stat-label">Excess Spend</div>
                    <div className={`radar-stat-value ${totalExcessSpend > 0 ? 'red' : 'green'}`}>{fmt(totalExcessSpend)}</div>
                </div>
            </div>

            {/* Alerts */}
            {anomalies.length === 0 ? (
                <div className="radar-empty">
                    <div className="radar-empty-emoji">🎉</div>
                    <h3>No Anomalies Detected!</h3>
                    <p>Your spending patterns look normal. Your finances are on track!</p>
                </div>
            ) : (
                <div style={{ marginBottom: '2rem' }}>
                    <div className="radar-section-title">⚡ Detected Anomalies ({totalAnomalies})</div>
                    <div className="radar-alerts">
                        {anomalies.map((a) => (
                            <div key={a.id} className={`radar-alert ${a.severity || 'warning'}`}>
                                <div className="radar-alert-emoji">{a.emoji}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="radar-alert-title">{a.title}</div>
                                    <div className="radar-alert-msg">{a.message}</div>
                                    {a.excess > 0 && (
                                        <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>
                                            Excess: {fmt(a.excess)} above average
                                        </div>
                                    )}
                                </div>
                                <div className="radar-alert-badge">{a.severity || 'ok'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Comparison Chart */}
            {categoryComparison.length > 0 && (
                <div className="radar-card">
                    <div className="radar-section-title">📊 This Month vs 3-Month Average</div>
                    <div className="radar-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryComparison} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                                    tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8' }} />
                                <Bar dataKey="thisMonth" name="This Month" fill="#f87171" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="average" name="3M Average" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Subscription Tracker */}
            {subscriptions.length > 0 && (
                <div className="radar-card">
                    <div className="radar-section-title">🔄 Recurring Transactions Detected</div>
                    <div className="radar-subs">
                        {subscriptions.map((s, i) => (
                            <div className="radar-sub-item" key={i}>
                                <div>
                                    <div className="radar-sub-name">{s.merchant}</div>
                                    <div className="radar-sub-info">Recurring • {s.occurrences} times in last 3 months</div>
                                </div>
                                <div className="radar-sub-amount">{fmt(s.amountEach)}/mo</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rescan Button */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button onClick={fetchData} className="radar-rescan-btn">
                    📡 Run Radar Scan Again
                </button>
            </div>
        </div>
    );
}
