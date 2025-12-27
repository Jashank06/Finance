import { useState, useEffect } from 'react';
import { FiRefreshCw, FiTrendingUp, FiTrendingDown, FiDollarSign, FiEdit, FiTrash2, FiDownload } from 'react-icons/fi';
import axios from 'axios';
import '../investments/Investment.css';

import { trackFeatureUsage, trackAction } from '../../utils/featureTracking';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const ProfitLoss = () => {
    const [plRecords, setPlRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, profit, loss

    useEffect(() => {
        trackFeatureUsage('/family/investments/profit-loss', 'view');
        fetchPLRecords();
        fetchSummary();
    }, []);

    const fetchPLRecords = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/profit-loss`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlRecords(response.data.data || []);
        } catch (error) {
            console.error('Error fetching P&L records:', error);
            setError('Failed to load P&L records. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/profit-loss/stats/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSummary(response.data.data);
        } catch (error) {
            console.error('Error fetching P&L summary:', error);
        }
    };

    const handleAutoGenerate = async () => {
        if (!window.confirm('This will automatically create P&L records by matching Purchase and Sale transactions from Trading Details. Continue?')) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/profit-loss/auto-generate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const stats = response.data.stats;
            let message = response.data.message;

            if (stats) {
                message += `\n\nDetails:\n`;
                message += `- Total Purchases: ${stats.totalPurchases}\n`;
                message += `- Total Sales: ${stats.totalSales}\n`;
                message += `- Matched & Created: ${stats.matched}\n`;

                if (stats.unmatchedSales > 0) {
                    message += `- Unmatched Sales: ${stats.unmatchedSales}\n`;
                    message += `\n(Unmatched sales don't have corresponding purchase records with same Script, Investor, and Trading ID)`;
                }

                if (stats.matched === 0 && stats.totalPurchases > 0 && stats.totalSales > 0) {
                    message += `\n\n⚠️ No matches found! Please ensure:\n`;
                    message += `1. Purchase and Sale records have exact same Script Name\n`;
                    message += `2. Purchase and Sale records have exact same Investor Name\n`;
                    message += `3. Purchase and Sale records have exact same Trading ID\n`;
                    message += `4. Purchase date is before Sale date`;
                } else if (stats.totalPurchases === 0 || stats.totalSales === 0) {
                    message += `\n\n⚠️ You need both Purchase AND Sale records in Trading Details to generate P&L!`;
                }
            }

            alert(message);
            await fetchPLRecords();
            await fetchSummary();
        } catch (error) {
            console.error('Error auto-generating P&L records:', error);
            setError('Failed to auto-generate P&L records. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this P&L record?')) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/profit-loss/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchPLRecords();
            await fetchSummary();
        } catch (error) {
            console.error('Error deleting P&L record:', error);
            setError('Failed to delete P&L record. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return '-';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatPercentage = (value) => {
        if (!value && value !== 0) return '-';
        const color = value >= 0 ? '#10b981' : '#ef4444';
        return (
            <span style={{ color, fontWeight: '600' }}>
                {value >= 0 ? '+' : ''}{value.toFixed(2)}%
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN');
    };

    // Filter records based on search and filter type
    const filteredRecords = plRecords.filter(record => {
        const matchesSearch = !searchTerm ||
            record.nameOfScript?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.nameOfInvestor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.tradingId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterType === 'all' ||
            (filterType === 'profit' && record.profitLossValue > 0) ||
            (filterType === 'loss' && record.profitLossValue < 0);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="investment-container">
            <div className="investment-header">
                <h1>Profit & Loss Analysis</h1>
                <p>Comprehensive profit and loss tracking from your trading activities</p>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={fetchPLRecords} className="retry-btn">
                            Retry
                        </button>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="investment-stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <div className="stat-card" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FiDollarSign size={32} />
                            <div>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total P/L</p>
                                <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>
                                    {formatCurrency(summary.totalProfitLoss)}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FiTrendingUp size={32} />
                            <div>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Profitable Trades</p>
                                <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>
                                    {summary.profitableTrades}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FiTrendingDown size={32} />
                            <div>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Losing Trades</p>
                                <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>
                                    {summary.losingTrades}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FiDollarSign size={32} />
                            <div>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Avg P/L %</p>
                                <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>
                                    {summary.avgProfitLossPercentage.toFixed(2)}%
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="investment-section">
                <div className="section-header">
                    <div>
                        <h3>Profit & Loss Records</h3>
                        <p className="section-subtitle">
                            Auto-generated from Trading Details - {filteredRecords.length} records
                        </p>
                    </div>
                    <button
                        className="add-button"
                        onClick={handleAutoGenerate}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FiRefreshCw /> {loading ? 'Processing...' : 'Auto-Generate from Trading Details'}
                    </button>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <input
                        type="text"
                        placeholder="Search by Script, Investor, or Trading ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: '1',
                            minWidth: '250px',
                            padding: '0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '0.95rem'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setFilterType('all')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: filterType === 'all' ? '2px solid #667eea' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                background: filterType === 'all' ? '#667eea' : 'white',
                                color: filterType === 'all' ? 'white' : '#374151',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterType('profit')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: filterType === 'profit' ? '2px solid #10b981' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                background: filterType === 'profit' ? '#10b981' : 'white',
                                color: filterType === 'profit' ? 'white' : '#374151',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Profit
                        </button>
                        <button
                            onClick={() => setFilterType('loss')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: filterType === 'loss' ? '2px solid #ef4444' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                background: filterType === 'loss' ? '#ef4444' : 'white',
                                color: filterType === 'loss' ? 'white' : '#374151',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Loss
                        </button>
                    </div>
                </div>

                <div className="table-container" style={{ overflowX: 'auto', maxWidth: '100vw' }}>
                    <table className="investments-table" style={{ minWidth: '100%', width: 'max-content' }}>
                        <thead>
                            <tr>
                                <th>Sr. No.</th>
                                <th>Mode</th>
                                <th>Demat Company</th>
                                <th>Holding</th>
                                <th>Investor</th>
                                <th>Trading ID</th>
                                <th>Script</th>
                                <th>Purchase Date</th>
                                <th>Quantity</th>
                                <th>Purchase Price</th>
                                <th>Purchase Valuation</th>
                                <th>Charges</th>
                                <th>Actual Purchase Price</th>
                                <th>Actual Purchase Valuation</th>
                                <th>Sales Date</th>
                                <th>Sales Quantity</th>
                                <th>Sales Price</th>
                                <th>Sales Charges</th>
                                <th>Sales Valuation</th>
                                <th>Actual Sales Price</th>
                                <th>Actual Sales Valuation</th>
                                <th>P/L Value</th>
                                <th>P/L %</th>
                                <th>Annualised P/L Value</th>
                                <th>Annualised P/L %</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="26" className="no-data">Loading...</td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="26" className="no-data">
                                        No P/L records found. Click "Auto-Generate from Trading Details" to create records.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record, index) => (
                                    <tr key={record._id}>
                                        <td>{index + 1}</td>
                                        <td>{record.modeOfTransaction}</td>
                                        <td>{record.dematCompany}</td>
                                        <td>{record.modeOfHolding}</td>
                                        <td>{record.nameOfInvestor}</td>
                                        <td>{record.tradingId}</td>
                                        <td><strong>{record.nameOfScript}</strong></td>
                                        <td>{formatDate(record.dateOfPurchase)}</td>
                                        <td>{record.purchaseQuantity}</td>
                                        <td>{formatCurrency(record.purchasePrice)}</td>
                                        <td>{formatCurrency(record.purchaseValuation)}</td>
                                        <td>{formatCurrency(record.purchaseCharges)}</td>
                                        <td>{formatCurrency(record.actualPriceOfPurchase)}</td>
                                        <td>{formatCurrency(record.actualPurchaseValuation)}</td>
                                        <td>{formatDate(record.dateOfSales)}</td>
                                        <td>{record.salesQuantity}</td>
                                        <td>{formatCurrency(record.salesPrice)}</td>
                                        <td>{formatCurrency(record.salesCharges)}</td>
                                        <td>{formatCurrency(record.salesValuation)}</td>
                                        <td>{formatCurrency(record.actualPriceOfSales)}</td>
                                        <td>{formatCurrency(record.actualSalesValuation)}</td>
                                        <td style={{
                                            fontWeight: '600',
                                            color: record.profitLossValue >= 0 ? '#10b981' : '#ef4444'
                                        }}>
                                            {formatCurrency(record.profitLossValue)}
                                        </td>
                                        <td>{formatPercentage(record.profitLossPercentage)}</td>
                                        <td>{formatCurrency(record.annualisedProfitLossValue)}</td>
                                        <td>{formatPercentage(record.annualisedProfitLossPercentage)}</td>
                                        <td>
                                            <div className="investment-actions">
                                                <button
                                                    className="btn-icon btn-danger"
                                                    onClick={() => handleDelete(record._id)}
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProfitLoss;
