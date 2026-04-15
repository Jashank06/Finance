import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './DailyTransactions.css';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const DailyCashRegister = () => {
    const [loading, setLoading] = useState(false);
    const [cashRecords, setCashRecords] = useState([]);
    const [showCashForm, setShowCashForm] = useState(false);
    const [editingCash, setEditingCash] = useState(null);
    const [cashForm, setCashForm] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        credit: '',
        debit: '',
        balance: '',
        category: '',
        affectedAccount: '',
        additionalDetails: ''
    });

    useEffect(() => {
    trackFeatureUsage('/family/daily/daily-cash-register', 'view');
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const cashRes = await api.get('/budget/daily-cash');
            setCashRecords(cashRes.data || []);
        } catch (error) {
            console.error('Error fetching cash records:', error);
        }
        setLoading(false);
    };

    const resetCashForm = () => {
        setCashForm({
            date: new Date().toISOString().split('T')[0],
            description: '',
            credit: '',
            debit: '',
            balance: '',
            category: '',
            affectedAccount: '',
            additionalDetails: ''
        });
        setEditingCash(null);
    };

    const handleCashSave = async () => {
        try {
            if (editingCash) {
                await api.put(`/budget/daily-cash/${editingCash._id}`, cashForm);
            } else {
                await api.post('/budget/daily-cash', cashForm);
            }
            fetchData();
            setShowCashForm(false);
            resetCashForm();
        } catch (error) {
            console.error('Error saving cash record:', error);
            alert('Error saving cash record');
        }
    };

    const handleCashEdit = (record) => {
        setCashForm(record);
        setEditingCash(record);
        setShowCashForm(true);
    };

    const handleCashDelete = async (id) => {
        if (confirm('Are you sure you want to delete this cash record?')) {
            try {
                await api.delete(`/budget/daily-cash/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting cash record:', error);
                alert('Error deleting cash record');
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading data...</div>;
    }

    return (
        <div className="daily-transaction-container">
            <div className="section-header">
                <h2>Daily Cash Register</h2>
                <button
                    className="add-btn"
                    onClick={() => {
                        resetCashForm();
                        setShowCashForm(true);
                    }}
                >
                    Add Cash Record
                </button>
            </div>

            {showCashForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingCash ? 'Edit' : 'Add'} Cash Record</h3>
                            <button onClick={() => setShowCashForm(false)} className="close-btn">×</button>
                        </div>
                        <div className="cash-form-grid">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={cashForm.date}
                                    onChange={(e) => setCashForm({ ...cashForm, date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={cashForm.description}
                                    onChange={(e) => setCashForm({ ...cashForm, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Credit</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={cashForm.credit}
                                    onChange={(e) => setCashForm({ ...cashForm, credit: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Debit</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={cashForm.debit}
                                    onChange={(e) => setCashForm({ ...cashForm, debit: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Balance</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={cashForm.balance}
                                    onChange={(e) => setCashForm({ ...cashForm, balance: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input
                                    type="text"
                                    value={cashForm.category}
                                    onChange={(e) => setCashForm({ ...cashForm, category: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Affected Account</label>
                                <input
                                    type="text"
                                    value={cashForm.affectedAccount}
                                    onChange={(e) => setCashForm({ ...cashForm, affectedAccount: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 3' }}>
                                <label>Additional Details</label>
                                <textarea
                                    value={cashForm.additionalDetails}
                                    onChange={(e) => setCashForm({ ...cashForm, additionalDetails: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowCashForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="save-btn"
                                onClick={handleCashSave}
                            >
                                {editingCash ? 'Update' : 'Save'} Record
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="table-container">
                {cashRecords.length === 0 ? (
                    <div className="no-data">No cash records found.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Credit</th>
                                <th>Debit</th>
                                <th>Balance</th>
                                <th>Account</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cashRecords.map((record) => (
                                <tr key={record._id}>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>{record.description}</td>
                                    <td>{record.category}</td>
                                    <td style={{ color: 'green' }}>{record.credit}</td>
                                    <td style={{ color: 'red' }}>{record.debit}</td>
                                    <td>{record.balance}</td>
                                    <td>{record.affectedAccount}</td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleCashEdit(record)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleCashDelete(record._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DailyCashRegister;
