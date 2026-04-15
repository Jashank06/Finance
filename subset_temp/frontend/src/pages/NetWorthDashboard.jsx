import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import './NetWorthDashboard.css';

const COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#fb923c'];

const fmt = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="nw-tooltip">
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
                {payload.map((p, i) => (
                    <div key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</div>
                ))}
            </div>
        );
    }
    return null;
};

export default function NetWorthDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [snapRes, histRes] = await Promise.all([
                api.get('/net-worth/snapshot'),
                api.get('/net-worth/history').catch(() => ({ data: { data: [] } }))
            ]);
            setData(snapRes.data.data);
            setHistory(histRes.data.data || []);
        } catch (e) {
            setError('Could not load Net Worth data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="nw-page">
                <div className="nw-loading">
                    <div className="nw-loading-ring" />
                    <p>Calculating your Net Worth...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="nw-page">
                <div className="nw-loading">
                    <p style={{ color: '#f87171' }}>{error || 'No data found.'}</p>
                    <button onClick={fetchData} style={{ marginTop: 12, padding: '0.5rem 1.2rem', borderRadius: 8, background: '#a78bfa', color: '#fff', border: 'none', cursor: 'pointer' }}>Retry</button>
                </div>
            </div>
        );
    }

    const { netWorth, totalAssets, totalLiabilities, breakdown } = data;

    // Donut chart data
    const donutData = [
        { name: 'Banks', value: breakdown.banks.total },
        { name: 'Investments', value: breakdown.investments.total },
        { name: 'Gold', value: breakdown.gold.total },
        { name: 'Cash', value: breakdown.cash.total },
        breakdown.liabilities.loans > 0 && { name: 'Liabilities', value: breakdown.liabilities.loans }
    ].filter(Boolean).filter(d => d.value > 0);

    // History for line chart
    const historyChartData = history.map(h => ({
        month: new Date(h.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        'Net Worth': h.netWorth,
        Assets: h.totalAssets
    }));

    const prevNetWorth = history.length >= 2 ? history[history.length - 2]?.netWorth : 0;
    const changeAmount = netWorth - (prevNetWorth || 0);
    const changePositive = changeAmount >= 0;

    const assets = [
        { icon: '🏦', name: 'Bank Accounts', sub: `${breakdown.banks.count} account(s)`, value: breakdown.banks.total, color: '#60a5fa', cls: 'blue' },
        { icon: '📈', name: 'Investments', sub: 'NPS, PPF, FD, MF, Shares', value: breakdown.investments.total, color: '#a78bfa', cls: 'purple' },
        { icon: '🥇', name: 'Gold & Bonds', sub: 'Gold, SGB, Silver', value: breakdown.gold.total, color: '#fbbf24', cls: 'yellow' },
        { icon: '💵', name: 'Cash in Hand', sub: '', value: breakdown.cash.total, color: '#34d399', cls: 'green' }
    ];

    return (
        <div className="nw-page">
            {/* Header */}
            <div className="nw-header">
                <h1>📊 Net Worth Dashboard</h1>
                <p>Your complete financial picture — updated in real-time</p>
            </div>

            {/* Hero */}
            <div className="nw-hero">
                <div className="nw-hero-label">Total Net Worth</div>
                <div className="nw-hero-value">{fmt(netWorth)}</div>
                {history.length >= 2 && (
                    <div className={`nw-hero-change ${changePositive ? 'positive' : 'negative'}`}>
                        {changePositive ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
                        {changePositive ? '+' : ''}{fmt(changeAmount)} from last month
                    </div>
                )}
                <div className="nw-hero-sub">
                    <div className="nw-hero-sub-item">
                        <div className="nw-hero-sub-label">Total Assets</div>
                        <div className="nw-hero-sub-value green">{fmt(totalAssets)}</div>
                    </div>
                    <div className="nw-hero-sub-item">
                        <div className="nw-hero-sub-label">Total Liabilities</div>
                        <div className="nw-hero-sub-value red">{fmt(totalLiabilities)}</div>
                    </div>
                    <div className="nw-hero-sub-item">
                        <div className="nw-hero-sub-label">Debt Ratio</div>
                        <div className="nw-hero-sub-value" style={{ color: '#e2e8f0' }}>
                            {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Strip */}
            <div className="nw-summary-strip">
                {assets.map((a, i) => (
                    <div className="nw-stat-card" key={i}>
                        <div className="nw-stat-emoji">{a.icon}</div>
                        <div className="nw-stat-label">{a.name}</div>
                        <div className={`nw-stat-value ${a.cls}`}>{fmt(a.value)}</div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="nw-grid">
                {/* Asset Breakdown */}
                <div className="nw-card">
                    <div className="nw-card-title">💼 Asset Allocation</div>
                    {donutData.length > 0 ? (
                        <div className="nw-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {donutData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No asset data yet</div>
                    )}
                    {/* Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {donutData.map((d, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#94a3b8' }}>
                                <span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                                {d.name}: {fmt(d.value)}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Assets & Liabilities Detail */}
                <div className="nw-card">
                    <div className="nw-card-title">⚖️ Assets vs Liabilities</div>
                    <div className="nw-asset-list">
                        {assets.filter(a => a.value > 0).map((a, i) => (
                            <div className="nw-asset-item" key={i}>
                                <div className="nw-asset-left">
                                    <div className="nw-asset-icon" style={{ background: `${a.color}22` }}>{a.icon}</div>
                                    <div>
                                        <div className="nw-asset-name">{a.name}</div>
                                        {a.sub && <div className="nw-asset-sub">{a.sub}</div>}
                                    </div>
                                </div>
                                <div className={`nw-asset-amount ${a.cls}`}>{fmt(a.value)}</div>
                            </div>
                        ))}
                        {breakdown.liabilities.loans > 0 && (
                            <div className="nw-asset-item" style={{ borderColor: 'rgba(220,38,38,0.15)', background: 'rgba(255,241,241,0.6)' }}>
                                <div className="nw-asset-left">
                                    <div className="nw-asset-icon" style={{ background: 'rgba(248,113,113,0.15)' }}>📉</div>
                                    <div>
                                        <div className="nw-asset-name">Outstanding Loans</div>
                                        <div className="nw-asset-sub">{breakdown.liabilities.count} loan(s)</div>
                                    </div>
                                </div>
                                <div className="nw-asset-amount red">-{fmt(breakdown.liabilities.loans)}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 6-Month Trend */}
                {historyChartData.length > 1 && (
                    <div className="nw-card nw-card-full">
                        <div className="nw-card-title">📈 6-Month Net Worth Trend</div>
                        <div className="nw-chart-container" style={{ height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={historyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="Net Worth" stroke="#a78bfa" strokeWidth={2.5}
                                        dot={{ fill: '#a78bfa', r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="Assets" stroke="#34d399" strokeWidth={2}
                                        dot={false} strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Bank Accounts Detail */}
                {breakdown.banks.accounts?.length > 0 && (
                    <div className="nw-card nw-card-full">
                        <div className="nw-card-title">🏦 Bank Accounts</div>
                        <div className="nw-asset-list">
                            {breakdown.banks.accounts.map((b, i) => (
                                <div className="nw-asset-item" key={i}>
                                    <div className="nw-asset-left">
                                        <div className="nw-asset-icon" style={{ background: 'rgba(96,165,250,0.15)' }}>🏦</div>
                                        <div>
                                            <div className="nw-asset-name">{b.name}</div>
                                            {b.accountNumber && <div className="nw-asset-sub">••••{String(b.accountNumber).slice(-4)}</div>}
                                        </div>
                                    </div>
                                    <div className="nw-asset-amount blue">{fmt(b.balance)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Refresh Button */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button onClick={fetchData} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '0.6rem 1.5rem', borderRadius: 10,
                    background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)',
                    color: '#a78bfa', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
                }}>
                    <FiRefreshCw size={14} /> Refresh Net Worth
                </button>
            </div>
        </div>
    );
}
