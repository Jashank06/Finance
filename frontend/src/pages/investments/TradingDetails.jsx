import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiTrendingUp, FiPieChart, FiBarChart2, FiClock, FiActivity } from 'react-icons/fi';
import axios from 'axios';
import './Investment.css';

const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5001'
    : 'https://finance-qr54.onrender.com';

const TradingDetails = () => {
    const [tradingRecords, setTradingRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'completed'
    const [completedRecordIds, setCompletedRecordIds] = useState(new Set());

    // Form state
    const [formData, setFormData] = useState({
        modeOfTransaction: 'Intra Day',
        typeOfTransaction: 'Purchase',
        dematCompany: '',
        modeOfHolding: '',
        nameOfInvestor: '',
        tradingId: '',
        nameOfScript: '',
        // Purchase fields
        dateOfPurchase: '',
        quantity: '',
        purchasePrice: '',
        charges1: 0,
        charges2: 0,
        charges3: 0,
        charges4: 0,
        charges5: 0,
        value: '',
        // Sell fields
        dateOfSale: '',
        salePrice: ''
    });

    useEffect(() => {
        fetchTradingRecords();
        fetchCompletedRecordIds();
    }, []);

    // Fetch completed record IDs
    const fetchCompletedRecordIds = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/profit-loss`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const plRecords = response.data.data || [];

            // Get all purchase and sale record IDs from P&L
            const completedIds = new Set();
            plRecords.forEach(pl => {
                if (pl.purchaseRecordId) completedIds.add(pl.purchaseRecordId);
                if (pl.salesRecordId) completedIds.add(pl.salesRecordId);
            });

            setCompletedRecordIds(completedIds);
        } catch (error) {
            console.error('Error fetching completed records:', error);
        }
    };

    const fetchTradingRecords = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/trading-details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTradingRecords(response.data.data || []);
        } catch (error) {
            console.error('Error fetching trading records:', error);
            setError('Failed to load trading records. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTransactionTypeChange = (e) => {
        const newType = e.target.value;
        setFormData(prev => ({
            ...prev,
            typeOfTransaction: newType,
            // Clear type-specific fields when switching
            dateOfPurchase: '',
            dateOfSale: '',
            purchasePrice: '',
            salePrice: '',
            value: ''
        }));
    };

    // Get available purchase records for auto-fill (not yet sold)
    const getAvailablePurchases = () => {
        return tradingRecords.filter(record =>
            record.typeOfTransaction === 'Purchase' && !completedRecordIds.has(record._id)
        );
    };

    // Auto-fill from selected purchase record
    const handlePurchaseSelect = (e) => {
        const purchaseId = e.target.value;
        if (!purchaseId) {
            // Clear if no selection
            return;
        }

        const selectedPurchase = tradingRecords.find(r => r._id === purchaseId);
        if (selectedPurchase) {
            setFormData(prev => ({
                ...prev,
                // Copy common fields from purchase
                modeOfTransaction: selectedPurchase.modeOfTransaction,
                dematCompany: selectedPurchase.dematCompany,
                modeOfHolding: selectedPurchase.modeOfHolding,
                nameOfInvestor: selectedPurchase.nameOfInvestor,
                tradingId: selectedPurchase.tradingId,
                nameOfScript: selectedPurchase.nameOfScript,
                quantity: selectedPurchase.quantity,
                // Keep sale-specific fields empty for user to fill
                dateOfSale: '',
                salePrice: '',
                charges1: 0,
                charges2: 0,
                charges3: 0,
                charges4: 0,
                charges5: 0
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            // Prepare data based on transaction type
            const submitData = {
                modeOfTransaction: formData.modeOfTransaction,
                typeOfTransaction: formData.typeOfTransaction,
                dematCompany: formData.dematCompany,
                modeOfHolding: formData.modeOfHolding,
                nameOfInvestor: formData.nameOfInvestor,
                tradingId: formData.tradingId,
                nameOfScript: formData.nameOfScript,
                quantity: parseFloat(formData.quantity) || 0,
                charges1: parseFloat(formData.charges1) || 0,
                charges2: parseFloat(formData.charges2) || 0,
                charges3: parseFloat(formData.charges3) || 0,
                charges4: parseFloat(formData.charges4) || 0,
                charges5: parseFloat(formData.charges5) || 0
            };

            if (formData.typeOfTransaction === 'Purchase') {
                submitData.dateOfPurchase = formData.dateOfPurchase;
                submitData.purchasePrice = parseFloat(formData.purchasePrice) || 0;
                submitData.value = parseFloat(formData.value) || 0;
            } else {
                submitData.dateOfSale = formData.dateOfSale;
                submitData.salePrice = parseFloat(formData.salePrice) || 0;
            }

            if (editingId) {
                await axios.put(`${API_URL}/api/trading-details/${editingId}`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/api/trading-details`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // Reset form and refresh data
            resetForm();
            await fetchTradingRecords();
            await fetchCompletedRecordIds(); // Refresh completed IDs
        } catch (error) {
            console.error('Error saving trading record:', error);
            setError('Failed to save trading record. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setFormData({
            modeOfTransaction: record.modeOfTransaction,
            typeOfTransaction: record.typeOfTransaction,
            dematCompany: record.dematCompany,
            modeOfHolding: record.modeOfHolding,
            nameOfInvestor: record.nameOfInvestor,
            tradingId: record.tradingId,
            nameOfScript: record.nameOfScript,
            dateOfPurchase: record.dateOfPurchase ? new Date(record.dateOfPurchase).toISOString().split('T')[0] : '',
            quantity: record.quantity || '',
            purchasePrice: record.purchasePrice || '',
            charges1: record.charges1 || 0,
            charges2: record.charges2 || 0,
            charges3: record.charges3 || 0,
            charges4: record.charges4 || 0,
            charges5: record.charges5 || 0,
            value: record.value || '',
            dateOfSale: record.dateOfSale ? new Date(record.dateOfSale).toISOString().split('T')[0] : '',
            salePrice: record.salePrice || ''
        });
        setEditingId(record._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this trading record?')) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/trading-details/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchTradingRecords();
        } catch (error) {
            console.error('Error deleting trading record:', error);
            setError('Failed to delete trading record. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            modeOfTransaction: 'Intra Day',
            typeOfTransaction: 'Purchase',
            dematCompany: '',
            modeOfHolding: '',
            nameOfInvestor: '',
            tradingId: '',
            nameOfScript: '',
            dateOfPurchase: '',
            quantity: '',
            purchasePrice: '',
            charges1: 0,
            charges2: 0,
            charges3: 0,
            charges4: 0,
            charges5: 0,
            value: '',
            dateOfSale: '',
            salePrice: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return '-';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN');
    };

    const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
        <button
            className={`tab-button ${isActive ? 'active' : ''}`}
            onClick={() => onClick(id)}
        >
            <Icon /> {label}
        </button>
    );

    return (
        <div className="investment-container">
            <div className="investment-header">
                <div>
                    <h1>Trading Details</h1>
                    <p>Track your trading transactions - purchases and sales</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-add-investment"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <FiPlus /> {showForm ? 'Hide Form' : 'Add Trading Record'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message" style={{ marginBottom: '20px' }}>
                    <p>{error}</p>
                    <button onClick={fetchTradingRecords} className="retry-btn">
                        Retry
                    </button>
                </div>
            )}

            <div className="tabs-container">
                <div className="tabs">
                    <TabButton
                        id="active"
                        label="Active Holdings"
                        icon={FiActivity}
                        isActive={viewMode === 'active'}
                        onClick={setViewMode}
                    />
                    <TabButton
                        id="completed"
                        label="History"
                        icon={FiClock}
                        isActive={viewMode === 'completed'}
                        onClick={setViewMode}
                    />
                </div>
            </div>

            <div className="investment-section">
                <div className="section-header">
                    <div>
                        <h3>
                            {viewMode === 'active' ? 'Current Portfolio' : 'Transaction History'}
                        </h3>
                        <p className="section-subtitle">
                            {viewMode === 'active'
                                ? 'Stocks you currently own and their valuations'
                                : 'Complete record of your closed trading positions'}
                        </p>
                    </div>
                </div>

                {showForm && (
                    <div className="investment-form-card">
                        <h2>{editingId ? 'Edit Trading Record' : 'Add New Trading Record'}</h2>

                        {/* Instruction based on type */}
                        <div style={{
                            background: formData.typeOfTransaction === 'Purchase'
                                ? '#ecfdf5'
                                : '#fef2f2',
                            color: formData.typeOfTransaction === 'Purchase' ? '#065f46' : '#991b1b',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            border: `1px solid ${formData.typeOfTransaction === 'Purchase' ? '#a7f3d0' : '#fecaca'}`
                        }}>
                            {formData.typeOfTransaction === 'Purchase' ? (
                                <>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                    <span>Incoming Position: You are recording a NEW PURCHASE</span>
                                </>
                            ) : (
                                <>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                                    <span>Closing Position: You are recording a SALE</span>
                                </>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="investment-form">
                            <div className="form-row">
                                <div className="form-field">
                                    <label>Mode of Transaction *</label>
                                    <select
                                        name="modeOfTransaction"
                                        value={formData.modeOfTransaction}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Intra Day">Intra Day</option>
                                        <option value="Delivery">Delivery</option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label>Type of Transaction *</label>
                                    <select
                                        name="typeOfTransaction"
                                        value={formData.typeOfTransaction}
                                        onChange={handleTransactionTypeChange}
                                        required
                                    >
                                        <option value="Purchase">Purchase</option>
                                        <option value="Sell">Sell</option>
                                    </select>
                                </div>

                                {/* Auto-fill from Purchase - Only show for Sell type */}
                                {formData.typeOfTransaction === 'Sell' && !editingId && (
                                    <div className="form-field">
                                        <label>
                                            Select Purchase Record to Auto-fill
                                            <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>
                                                (Optional but Recommended)
                                            </span>
                                        </label>
                                        <select
                                            onChange={handlePurchaseSelect}
                                            style={{
                                                background: '#f0fdf4',
                                                border: '2px solid #10b981'
                                            }}
                                        >
                                            <option value="">-- Select a Purchase to Auto-fill --</option>
                                            {getAvailablePurchases().map(purchase => (
                                                <option key={purchase._id} value={purchase._id}>
                                                    {purchase.nameOfScript} - {purchase.nameOfInvestor} - ID: {purchase.tradingId} - {formatDate(purchase.dateOfPurchase)}
                                                </option>
                                            ))}
                                        </select>
                                        <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                                            ✨ Select a purchase record to automatically fill Script, Investor, and Trading ID
                                        </small>
                                    </div>
                                )}
                            </div>



                            <div className="form-row">
                                <div className="form-field">
                                    <label>Demat Company *</label>
                                    <input
                                        type="text"
                                        name="dematCompany"
                                        value={formData.dematCompany}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Mode of Holding *</label>
                                    <input
                                        type="text"
                                        name="modeOfHolding"
                                        value={formData.modeOfHolding}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label>
                                        Name of Investor *
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                                            (Must match for P&L)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nameOfInvestor"
                                        value={formData.nameOfInvestor}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Jay, Rahul Sharma"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>
                                        Trading ID *
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                                            (Must match for P&L)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="tradingId"
                                        value={formData.tradingId}
                                        onChange={handleInputChange}
                                        placeholder="e.g., TXN001, 253243"
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label>
                                        Name of Script *
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                                            (Must match exactly for P&L)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nameOfScript"
                                        value={formData.nameOfScript}
                                        onChange={handleInputChange}
                                        placeholder="e.g., RELIANCE, TCS, INFY"
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label>{formData.typeOfTransaction === 'Purchase' ? 'Date of Purchase' : 'Date of Sale'} *</label>
                                    <input
                                        type="date"
                                        name={formData.typeOfTransaction === 'Purchase' ? 'dateOfPurchase' : 'dateOfSale'}
                                        value={formData.typeOfTransaction === 'Purchase' ? formData.dateOfPurchase : formData.dateOfSale}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>Quantity *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label>{formData.typeOfTransaction === 'Purchase' ? 'Purchase Price' : 'Sale Price'} *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name={formData.typeOfTransaction === 'Purchase' ? 'purchasePrice' : 'salePrice'}
                                        value={formData.typeOfTransaction === 'Purchase' ? formData.purchasePrice : formData.salePrice}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                {formData.typeOfTransaction === 'Purchase' && (
                                    <div className="form-field">
                                        <label>Value</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="value"
                                            value={formData.value}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>Charges 1</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="charges1"
                                        value={formData.charges1}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Charges 2</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="charges2"
                                        value={formData.charges2}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Charges 3</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="charges3"
                                        value={formData.charges3}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>Charges 4</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="charges4"
                                        value={formData.charges4}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Charges 5</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="charges5"
                                        value={formData.charges5}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-actions" style={{ marginTop: '24px' }}>
                                <button type="submit" className="btn-add-investment" disabled={loading}>
                                    {loading ? 'Saving...' : (editingId ? 'Update Record' : 'Save Record')}
                                </button>
                                <button type="button" className="btn-secondary" onClick={resetForm} style={{ padding: '12px 24px' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="table-container" style={{ overflowX: 'auto', maxWidth: '100vw' }}>
                    <table className="investments-table" style={{ minWidth: '100%', width: 'max-content' }}>
                        <thead>
                            <tr>
                                <th>Mode</th>
                                <th>Type</th>
                                <th>Demat Company</th>
                                <th>Investor</th>
                                <th>Script</th>
                                <th>Date</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Charges</th>
                                <th style={{ minWidth: '100px' }}>Valuation</th>
                                <th>Actual Price</th>
                                <th>Actual Valuation</th>
                                {tradingRecords.some(r => r.typeOfTransaction === 'Purchase') && (
                                    <>
                                        <th>P/L</th>
                                        <th>Annualised P/L</th>
                                    </>
                                )}
                                {viewMode === 'active' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && tradingRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="15" className="no-data">Loading...</td>
                                </tr>
                            ) : (() => {
                                const filteredRecords = viewMode === 'active'
                                    ? tradingRecords.filter(record => !completedRecordIds.has(record._id))
                                    : tradingRecords.filter(record => completedRecordIds.has(record._id));

                                return filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="15" className="no-data">
                                            {viewMode === 'active'
                                                ? 'No active holdings. Add a Purchase record to get started.'
                                                : 'No completed transactions yet. Complete a sale to see history.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record, index) => (
                                        <tr key={record._id}>
                                            <td>{record.modeOfTransaction}</td>
                                            <td>
                                                <span className={`investment-type-badge ${record.typeOfTransaction === 'Purchase' ? 'bg-green-500' : 'bg-red-500'}`}>
                                                    {record.typeOfTransaction}
                                                </span>
                                            </td>
                                            <td>{record.dematCompany}</td>
                                            <td>{record.nameOfInvestor}</td>
                                            <td>{record.nameOfScript}</td>
                                            <td>{formatDate(record.typeOfTransaction === 'Purchase' ? record.dateOfPurchase : record.dateOfSale)}</td>
                                            <td>{record.quantity}</td>
                                            <td>{formatCurrency(record.typeOfTransaction === 'Purchase' ? record.purchasePrice : record.salePrice)}</td>
                                            <td>
                                                {formatCurrency(
                                                    (record.charges1 || 0) +
                                                    (record.charges2 || 0) +
                                                    (record.charges3 || 0) +
                                                    (record.charges4 || 0) +
                                                    (record.charges5 || 0)
                                                )}
                                            </td>
                                            <td>{formatCurrency(record.typeOfTransaction === 'Purchase' ? record.purchaseValuation : record.salesValuation)}</td>
                                            <td>{formatCurrency(record.typeOfTransaction === 'Purchase' ? record.actualPriceOfPurchase : record.actualPriceOfSales)}</td>
                                            <td>{formatCurrency(record.actualValuation)}</td>
                                            {tradingRecords.some(r => r.typeOfTransaction === 'Purchase') && (
                                                <>
                                                    <td>{record.typeOfTransaction === 'Purchase' ? formatCurrency(record.profitLoss) : '-'}</td>
                                                    <td>{record.typeOfTransaction === 'Purchase' ? formatCurrency(record.annualisedProfitLoss) : '-'}</td>
                                                </>
                                            )}
                                            {viewMode === 'active' && (
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => handleEdit(record)}
                                                            title="Edit"
                                                        >
                                                            <FiEdit />
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => handleDelete(record._id)}
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TradingDetails;
