import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiTrendingUp, FiPieChart, FiBarChart2, FiClock, FiActivity, FiRefreshCw } from 'react-icons/fi';
import { staticAPI } from '../../utils/staticAPI';
import { investmentValuationAPI } from '../../utils/investmentValuationAPI';
import api from '../../utils/api';
import './Investment.css';

import { trackFeatureUsage, trackAction } from '../../utils/featureTracking';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const TradingDetails = () => {
    const [tradingRecords, setTradingRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'completed'
    const [completedRecordIds, setCompletedRecordIds] = useState(new Set());
    
    // New state for dropdowns
    const [subBrokers, setSubBrokers] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [showCustomInvestor, setShowCustomInvestor] = useState(false);
    const [showCustomDemat, setShowCustomDemat] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        modeOfTransaction: 'Intra Day',
        typeOfTransaction: 'Purchase',
        dematCompany: '',
        modeOfHolding: 'Demat',
        nameOfInvestor: '',
        tradingId: '',
        nameOfScript: '',
        exchange: 'NSE',
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
        trackFeatureUsage('/family/investments/trading-details', 'view');
        fetchTradingRecords();
        fetchCompletedRecordIds();
        fetchSubBrokers();
        fetchFamilyMembers();
    }, []);

    // Auto-refresh prices when records load
    useEffect(() => {
        if (tradingRecords.length > 0) {
            const hasPurchases = tradingRecords.some(r => 
                r.typeOfTransaction === 'Purchase' && 
                (r.remainingQuantity === undefined || r.remainingQuantity > 0)
            );
            if (hasPurchases) {
                refreshMarketPrices();
            }
        }
    }, [tradingRecords.length, completedRecordIds]);

    // Price auto-fetch effect
    useEffect(() => {
        const scrip = formData.nameOfScript;
        if (!scrip || scrip.length < 2 || editingId) return;

        const timer = setTimeout(async () => {
            try {
                const res = await investmentValuationAPI.getStockPriceByScrip(scrip, formData.exchange);
                if (res.data?.success && res.data.data?.price) {
                    const price = res.data.data.price;
                    setFormData(prev => {
                        const newState = {
                            ...prev,
                            purchasePrice: String(price)
                        };
                        // Also update Value if quantity exists
                        const qty = parseFloat(prev.quantity);
                        if (!isNaN(qty)) {
                            newState.value = (qty * price).toFixed(2);
                        }
                        return newState;
                    });
                }
            } catch (err) {
                console.warn('Could not auto-fetch price for:', scrip);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [formData.nameOfScript, formData.exchange, editingId]);

    const fetchSubBrokers = async () => {
        try {
            const res = await staticAPI.getBasicDetails();
            if (Array.isArray(res.data) && res.data.length > 0) {
                setSubBrokers(res.data[0].subBrokers || []);
            }
        } catch (err) {
            console.error('Error fetching sub-brokers:', err);
        }
    };

    const fetchFamilyMembers = async () => {
        try {
            const response = await staticAPI.getFamilyProfile();
            if (response.data && response.data.length > 0) {
                const members = response.data[0].members || [];
                setFamilyMembers(members);
            }
        } catch (error) {
            console.error('Error fetching family members:', error);
        }
    };

    // Fetch completed record IDs and P&L data
    const [plData, setPlData] = useState([]);
    const fetchCompletedRecordIds = async () => {
        try {
            const response = await api.get('/profit-loss');
            const plRecords = response.data.data || [];
            setPlData(plRecords);

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
            const response = await api.get('/trading-details');
            const records = response.data.data || [];
            setTradingRecords(records);
            
            // Immediately refresh prices for active holdings
            if (records.some(r => r.typeOfTransaction === 'Purchase' && (r.remainingQuantity === undefined || r.remainingQuantity > 0))) {
                // Pass the records directly to avoid stale state issues
                refreshMarketPrices(records);
            }
        } catch (error) {
            console.error('Error fetching trading records:', error);
            setError('Failed to load trading records. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = {
                ...prev,
                [name]: value
            };

            // Auto-calculate Value: Quantity * Price + Charges
            if (['quantity', 'purchasePrice', 'salePrice', 'charges1', 'charges2', 'charges3', 'charges4', 'charges5'].includes(name)) {
                const qty = parseFloat(name === 'quantity' ? value : prev.quantity) || 0;
                const pPrice = parseFloat(name === 'purchasePrice' ? value : prev.purchasePrice) || 0;
                const sPrice = parseFloat(name === 'salePrice' ? value : prev.salePrice) || 0;
                
                const c1 = parseFloat(name === 'charges1' ? value : prev.charges1) || 0;
                const c2 = parseFloat(name === 'charges2' ? value : prev.charges2) || 0;
                const c3 = parseFloat(name === 'charges3' ? value : prev.charges3) || 0;
                const c4 = parseFloat(name === 'charges4' ? value : prev.charges4) || 0;
                const c5 = parseFloat(name === 'charges5' ? value : prev.charges5) || 0;
                const totalCharges = c1 + c2 + c3 + c4 + c5;

                const basePrice = prev.typeOfTransaction === 'Purchase' ? pPrice : sPrice;
                
                if (qty > 0 && basePrice > 0) {
                    const actualPrice = prev.typeOfTransaction === 'Purchase' 
                        ? (basePrice + totalCharges) 
                        : (basePrice - totalCharges);
                    newState.value = (qty * actualPrice).toFixed(2);
                }
            }
            return newState;
        });
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
                quantity: selectedPurchase.remainingQuantity ?? selectedPurchase.quantity,
                // Auto-populate sale price with current market price if available
                dateOfSale: new Date().toISOString().split('T')[0],
                salePrice: selectedPurchase.currentPrice ? String(selectedPurchase.currentPrice) : '',
                charges1: selectedPurchase.charges1 || 0,
                charges2: selectedPurchase.charges2 || 0,
                charges3: selectedPurchase.charges3 || 0,
                charges4: selectedPurchase.charges4 || 0,
                charges5: selectedPurchase.charges5 || 0,
                value: selectedPurchase.currentPrice 
                    ? ((selectedPurchase.remainingQuantity ?? selectedPurchase.quantity) * selectedPurchase.currentPrice).toFixed(2)
                    : ''
            }));
        }
    };

    const [loadingPrices, setLoadingPrices] = useState(false);
    const refreshMarketPrices = async (manualRecords = null) => {
        try {
            setLoadingPrices(true);
            const recordsToProcess = manualRecords || tradingRecords;
            const activeRecords = recordsToProcess.filter(r => 
                r.typeOfTransaction === 'Purchase' && 
                (r.remainingQuantity === undefined || r.remainingQuantity > 0)
            );
            
            const updatedRecords = [...recordsToProcess];
            
            for (const record of activeRecords) {
                try {
                    const res = await investmentValuationAPI.getStockPriceByScrip(record.nameOfScript, record.exchange || 'NSE');
                    if (res.data?.success && res.data.data?.price) {
                        const currentPrice = res.data.data.price;
                        const idx = updatedRecords.findIndex(r => r._id === record._id);
                        if (idx !== -1) {
                            const actualPrice = record.actualPriceOfPurchase || record.purchasePrice;
                            const qty = record.remainingQuantity ?? record.quantity;
                            const profitLoss = (currentPrice - actualPrice) * qty;
                            
                            updatedRecords[idx] = {
                                ...updatedRecords[idx],
                                currentPrice,
                                currentValuation: currentPrice * qty,
                                profitLoss,
                                annualisedProfitLoss: profitLoss
                            };
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching price for ${record.nameOfScript}:`, err);
                }
            }
            
            setTradingRecords(updatedRecords);
        } catch (error) {
            console.error('Error refreshing prices:', error);
            setError('Failed to refresh market prices.');
        } finally {
            setLoadingPrices(false);
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
                exchange: formData.exchange,
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
                await api.put(`/trading-details/${editingId}`, submitData);
            } else {
                await api.post('/trading-details', submitData);
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
            exchange: record.exchange || 'NSE',
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

        // Detect if investor is a family member or custom
        const isFamilyMember = familyMembers.some(m => m.name === record.nameOfInvestor);
        if (!isFamilyMember && record.nameOfInvestor) {
            setShowCustomInvestor(true);
        } else {
            setShowCustomInvestor(false);
        }

        const isKnownBroker = subBrokers.some(sb => sb.nameOfCompany === record.dematCompany);
        if (!isKnownBroker && record.dematCompany && record.modeOfHolding === 'Demat') {
            setShowCustomDemat(true);
        } else {
            setShowCustomDemat(false);
        }

        setEditingId(record._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this trading record?')) return;

        try {
            setLoading(true);
            await api.delete(`/trading-details/${id}`);
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
            exchange: 'NSE',
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
        setShowCustomInvestor(false);
        setShowCustomDemat(false);
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
                    <button
                        className="btn-refresh"
                        onClick={refreshMarketPrices}
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            background: '#f0fdf4',
                            color: '#16a34a',
                            border: '1px solid #bbf7d0',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        <FiActivity /> {loading ? 'Refreshing...' : 'Refresh Prices'}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                        {viewMode === 'active' && (
                            <button 
                                className="btn-secondary" 
                                onClick={refreshMarketPrices} 
                                disabled={loadingPrices}
                                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <FiRefreshCw className={loadingPrices ? 'spin' : ''} />
                                {loadingPrices ? 'Refreshing...' : 'Refresh Prices'}
                            </button>
                        )}
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
                                    <label>Mode of Holding *</label>
                                    <select
                                        name="modeOfHolding"
                                        value={formData.modeOfHolding}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Demat">Demat</option>
                                        <option value="Physical">Physical</option>
                                    </select>
                                </div>

                                {formData.modeOfHolding === 'Demat' && (
                                    <div className="form-field">
                                        <label>Demat Company *</label>
                                        <select
                                            name="dematCompany"
                                            value={showCustomDemat ? 'Other' : formData.dematCompany}
                                            onChange={(e) => {
                                                if (e.target.value === 'Other') {
                                                    setShowCustomDemat(true);
                                                    setFormData(prev => ({ ...prev, dematCompany: '' }));
                                                } else {
                                                    setShowCustomDemat(false);
                                                    setFormData(prev => ({ ...prev, dematCompany: e.target.value }));
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">Select Demat Company</option>
                                            {subBrokers.map((sb, idx) => (
                                                <option key={idx} value={sb.nameOfCompany}>
                                                    {sb.nameOfCompany}
                                                </option>
                                            ))}
                                            <option value="Other">Other</option>
                                        </select>
                                        {showCustomDemat && (
                                            <input
                                                type="text"
                                                name="dematCompany"
                                                value={formData.dematCompany}
                                                placeholder="Enter custom demat company"
                                                onChange={handleInputChange}
                                                style={{ marginTop: '8px' }}
                                                required
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="form-field">
                                    <label>
                                        Name of Investor *
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                                            (Must match for P&L)
                                        </span>
                                    </label>
                                    <select
                                        name="nameOfInvestor"
                                        value={showCustomInvestor ? 'Other' : formData.nameOfInvestor}
                                        onChange={(e) => {
                                            if (e.target.value === 'Other') {
                                                setShowCustomInvestor(true);
                                                setFormData(prev => ({ ...prev, nameOfInvestor: '' }));
                                            } else {
                                                setShowCustomInvestor(false);
                                                setFormData(prev => ({ ...prev, nameOfInvestor: e.target.value }));
                                            }
                                        }}
                                        required
                                    >
                                        <option value="">Select Investor</option>
                                        {familyMembers.map((member, idx) => (
                                            <option key={idx} value={member.name}>{member.name}</option>
                                        ))}
                                        <option value="Other">Other</option>
                                    </select>
                                    {showCustomInvestor && (
                                        <input
                                            type="text"
                                            name="nameOfInvestor"
                                            value={formData.nameOfInvestor}
                                            onChange={handleInputChange}
                                            placeholder="Enter custom investor name"
                                            required
                                            style={{ marginTop: '8px' }}
                                        />
                                    )}
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
                                    <div style={{ display: 'flex', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e5e7eb', transition: 'all 0.2s ease' }}>
                                        <input
                                            type="text"
                                            name="nameOfScript"
                                            value={formData.nameOfScript}
                                            onChange={handleInputChange}
                                            placeholder="e.g., RELIANCE, TCS, INFY"
                                            required
                                            style={{ flex: 1, border: 'none', padding: '12px 16px', borderRadius: 0, outline: 'none' }}
                                        />
                                        <div style={{ width: '1px', background: '#e5e7eb', margin: '8px 0' }}></div>
                                        <select
                                            name="exchange"
                                            value={formData.exchange}
                                            onChange={handleInputChange}
                                            style={{ width: '90px', border: 'none', background: '#f8fafc', padding: '12px 12px', borderRadius: 0, outline: 'none', cursor: 'pointer', fontWeight: '700', color: '#10b981' }}
                                        >
                                            <option value="NSE">NSE</option>
                                            <option value="BSE">BSE</option>
                                        </select>
                                    </div>
                                    <small style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                                        ✨ Market price will be auto-fetched
                                    </small>
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
                                        <label>Actual Valuation (Qty × [Price + Charges])</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="value"
                                            value={formData.value}
                                            onChange={handleInputChange}
                                            style={{ backgroundColor: '#f0fdf4', fontWeight: 'bold', border: '1px solid #10b981' }}
                                        />
                                        <small style={{ color: '#059669', fontSize: '0.75rem' }}>Auto-calculated (Gross + Charges)</small>
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
                                <th style={{ minWidth: '100px' }}>Actual Valuation</th>
                                {viewMode === 'active' && (
                                    <>
                                        <th>Current Price</th>
                                        <th>Current Valuation</th>
                                    </>
                                )}
                                {tradingRecords.some(r => r.typeOfTransaction === 'Purchase') && (
                                    <>
                                        <th>P/L</th>
                                        <th>Trend</th>
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
                                    ? tradingRecords.filter(record => 
                                        record.typeOfTransaction === 'Purchase' && 
                                        (record.remainingQuantity === undefined || record.remainingQuantity > 0)
                                      )
                                    : tradingRecords.filter(record => 
                                        record.typeOfTransaction === 'Sell' || 
                                        (record.typeOfTransaction === 'Purchase' && record.remainingQuantity === 0)
                                      );

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
                                            <td>
                                                {record.typeOfTransaction === 'Purchase' ? (
                                                    <span>
                                                        {record.remainingQuantity ?? record.quantity} 
                                                        {record.remainingQuantity < record.quantity && (
                                                            <small style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '10px' }}>
                                                                (of {record.quantity})
                                                            </small>
                                                        )}
                                                    </span>
                                                ) : record.quantity}
                                            </td>
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
                                            <td>
                                                {formatCurrency(
                                                    record.typeOfTransaction === 'Purchase'
                                                        ? (record.actualPriceOfPurchase || record.purchasePrice) * (record.remainingQuantity ?? record.quantity)
                                                        : record.actualValuation
                                                )}
                                            </td>
                                            {viewMode === 'active' && (
                                                <>
                                                    <td>{record.currentPrice ? formatCurrency(record.currentPrice) : '-'}</td>
                                                    <td style={{ fontWeight: 'bold' }}>{record.currentValuation ? formatCurrency(record.currentValuation) : '-'}</td>
                                                </>
                                            )}
                                            
                                            {tradingRecords.some(r => r.typeOfTransaction === 'Purchase') && (
                                                <>
                                                    <td style={{ 
                                                        color: (() => {
                                                            const pL = record.typeOfTransaction === 'Sell' 
                                                                ? plData.filter(pl => pl.salesRecordId === record._id).reduce((sum, pl) => sum + (pl.profitLossValue || 0), 0)
                                                                : record.profitLoss;
                                                            return pL > 0 ? '#10b981' : pL < 0 ? '#ef4444' : '#f59e0b';
                                                        })(),
                                                        fontWeight: 'bold',
                                                        background: (() => {
                                                            const pL = record.typeOfTransaction === 'Sell' 
                                                                ? plData.filter(pl => pl.salesRecordId === record._id).reduce((sum, pl) => sum + (pl.profitLossValue || 0), 0)
                                                                : record.profitLoss;
                                                            return pL > 0 ? '#f0fdf4' : pL < 0 ? '#fef2f2' : '#fffbeb';
                                                        })(),
                                                        borderRadius: '8px',
                                                        padding: '4px 8px'
                                                    }}>
                                                        {(() => {
                                                            const pL = record.typeOfTransaction === 'Sell' 
                                                                ? plData.filter(pl => pl.salesRecordId === record._id).reduce((sum, pl) => sum + (pl.profitLossValue || 0), 0)
                                                                : record.profitLoss;
                                                            return (pL !== undefined && pL !== null) ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                                                                    {pL > 0 ? <FiTrendingUp /> : pL < 0 ? <FiTrendingDown /> : null}
                                                                    {formatCurrency(pL)}
                                                                </div>
                                                            ) : '-';
                                                        })()}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {(() => {
                                                            const pL = record.typeOfTransaction === 'Sell' 
                                                                ? plData.filter(pl => pl.salesRecordId === record._id).reduce((sum, pl) => sum + (pl.profitLossValue || 0), 0)
                                                                : record.profitLoss;
                                                            
                                                            if (pL === undefined || pL === null || isNaN(pL)) return '-';

                                                            const purchaseCost = record.typeOfTransaction === 'Purchase'
                                                                ? (record.actualPriceOfPurchase || record.purchasePrice) * (record.remainingQuantity ?? record.quantity)
                                                                : (record.actualValuation - pL); // Derived purchase cost for the sold amount

                                                            const trend = purchaseCost !== 0 ? (pL / purchaseCost) * 100 : 0;
                                                            
                                                            return (
                                                                <span style={{ 
                                                                    color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : 'inherit',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
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
