import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './DailyTransactions.css';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const ChequeRegister = () => {
    const [loading, setLoading] = useState(false);
    const [chequeRecords, setChequeRecords] = useState([]);
    const [showChequeForm, setShowChequeForm] = useState(false);
    const [editingCheque, setEditingCheque] = useState(null);
    const [chequeForm, setChequeForm] = useState({
        receivedDate: new Date().toISOString().split('T')[0],
        chequeDepositDate: '',
        difference: '',
        reasonForDelay: '',
        chequePartyDetails: '',
        accountHead: '',
        deposit: '',
        withdrawal: '',
        amount: '',
        bank: '',
        chequeNumber: '',
        chequeDepositedInBank: '',
        receivedFor: '',
        receivedBy: ''
    });

    useEffect(() => {
    trackFeatureUsage('/family/daily/cheque-register', 'view');
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const chequeRes = await api.get('/budget/cheque-register');
            setChequeRecords(chequeRes.data || []);
        } catch (error) {
            console.error('Error fetching cheque records:', error);
        }
        setLoading(false);
    };

    const resetChequeForm = () => {
        setChequeForm({
            receivedDate: new Date().toISOString().split('T')[0],
            chequeDepositDate: '',
            difference: '',
            reasonForDelay: '',
            chequePartyDetails: '',
            accountHead: '',
            deposit: '',
            withdrawal: '',
            amount: '',
            bank: '',
            chequeNumber: '',
            chequeDepositedInBank: '',
            receivedFor: '',
            receivedBy: ''
        });
        setEditingCheque(null);
    };

    const handleChequeSave = async () => {
        try {
            if (editingCheque) {
                await api.put(`/budget/cheque-register/${editingCheque._id}`, chequeForm);
            } else {
                await api.post('/budget/cheque-register', chequeForm);
            }
            fetchData();
            setShowChequeForm(false);
            resetChequeForm();
        } catch (error) {
            console.error('Error saving cheque record:', error);
            alert('Error saving cheque record');
        }
    };

    const handleChequeEdit = (record) => {
        setChequeForm(record);
        setEditingCheque(record);
        setShowChequeForm(true);
    };

    const handleChequeDelete = async (id) => {
        if (confirm('Are you sure you want to delete this cheque record?')) {
            try {
                await api.delete(`/budget/cheque-register/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting cheque record:', error);
                alert('Error deleting cheque record');
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading data...</div>;
    }

    return (
        <div className="daily-transaction-container">
            <div className="section-header">
                <h2>Cheque Register</h2>
                <button
                    className="add-btn"
                    onClick={() => {
                        resetChequeForm();
                        setShowChequeForm(true);
                    }}
                >
                    Add Cheque Record
                </button>
            </div>

            {showChequeForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingCheque ? 'Edit' : 'Add'} Cheque Record</h3>
                            <button onClick={() => setShowChequeForm(false)} className="close-btn">×</button>
                        </div>
                        <div className="cheque-form-grid">
                            <div className="form-group">
                                <label>Received Date</label>
                                <input
                                    type="date"
                                    value={chequeForm.receivedDate}
                                    onChange={(e) => setChequeForm({ ...chequeForm, receivedDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Cheque Deposit Date</label>
                                <input
                                    type="date"
                                    value={chequeForm.chequeDepositDate}
                                    onChange={(e) => setChequeForm({ ...chequeForm, chequeDepositDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Difference (Days)</label>
                                <input
                                    type="number"
                                    value={chequeForm.difference}
                                    onChange={(e) => setChequeForm({ ...chequeForm, difference: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Reason for Delay</label>
                                <input
                                    type="text"
                                    value={chequeForm.reasonForDelay}
                                    onChange={(e) => setChequeForm({ ...chequeForm, reasonForDelay: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Cheque Party Details</label>
                                <input
                                    type="text"
                                    value={chequeForm.chequePartyDetails}
                                    onChange={(e) => setChequeForm({ ...chequeForm, chequePartyDetails: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Account Head</label>
                                <input
                                    type="text"
                                    value={chequeForm.accountHead}
                                    onChange={(e) => setChequeForm({ ...chequeForm, accountHead: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Deposit</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={chequeForm.deposit}
                                    onChange={(e) => setChequeForm({ ...chequeForm, deposit: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Withdrawal</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={chequeForm.withdrawal}
                                    onChange={(e) => setChequeForm({ ...chequeForm, withdrawal: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={chequeForm.amount}
                                    onChange={(e) => setChequeForm({ ...chequeForm, amount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Bank</label>
                                <input
                                    type="text"
                                    value={chequeForm.bank}
                                    onChange={(e) => setChequeForm({ ...chequeForm, bank: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Cheque Number</label>
                                <input
                                    type="text"
                                    value={chequeForm.chequeNumber}
                                    onChange={(e) => setChequeForm({ ...chequeForm, chequeNumber: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Cheque Deposited In Bank</label>
                                <input
                                    type="text"
                                    value={chequeForm.chequeDepositedInBank}
                                    onChange={(e) => setChequeForm({ ...chequeForm, chequeDepositedInBank: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Received For</label>
                                <input
                                    type="text"
                                    value={chequeForm.receivedFor}
                                    onChange={(e) => setChequeForm({ ...chequeForm, receivedFor: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Received By</label>
                                <input
                                    type="text"
                                    value={chequeForm.receivedBy}
                                    onChange={(e) => setChequeForm({ ...chequeForm, receivedBy: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowChequeForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="save-btn"
                                onClick={handleChequeSave}
                            >
                                {editingCheque ? 'Update' : 'Save'} Record
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="table-container">
                {chequeRecords.length === 0 ? (
                    <div className="no-data">No cheque records found.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Party Details</th>
                                <th>Bank</th>
                                <th>Cheque No.</th>
                                <th>Deposit</th>
                                <th>Withdrawal</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chequeRecords.map((record) => (
                                <tr key={record._id}>
                                    <td>{new Date(record.receivedDate).toLocaleDateString()}</td>
                                    <td>{record.chequePartyDetails}</td>
                                    <td>{record.bank}</td>
                                    <td>{record.chequeNumber}</td>
                                    <td>{record.deposit}</td>
                                    <td>{record.withdrawal}</td>
                                    <td>{record.amount}</td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleChequeEdit(record)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleChequeDelete(record._id)}
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

export default ChequeRegister;
