import { useState, useEffect } from 'react';
import { investmentProfileAPI } from '../utils/investmentProfileAPI';
import { FiX } from 'react-icons/fi';

const GoldBondProfileModal = ({ isOpen, onClose, onSuccess, editData }) => {
    const [formData, setFormData] = useState({
        name: '',
        provider: '',
        subBroker: '',
        nameOfInvestor: '',
        dematAccountNumber: '',
        url: '',
        loginUserId: '',
        password: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setFormData({
                name: editData.name || '',
                provider: editData.provider || '',
                subBroker: editData.subBroker || '',
                nameOfInvestor: editData.nameOfInvestor || '',
                dematAccountNumber: editData.dematAccountNumber || '',
                url: editData.url || '',
                loginUserId: editData.loginUserId || '',
                password: editData.password || '',
                notes: editData.notes || ''
            });
        } else {
            setFormData({
                name: '',
                provider: '',
                subBroker: '',
                nameOfInvestor: '',
                dematAccountNumber: '',
                url: '',
                loginUserId: '',
                password: '',
                notes: ''
            });
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editData) {
                await investmentProfileAPI.updateGoldBonds(editData._id, formData);
            } else {
                await investmentProfileAPI.createGoldBonds(formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving Gold/Bond profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{editData ? 'Edit Gold/Bond Profile' : 'Add Gold/Bond Profile'}</h2>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Name (Description) *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Digital Gold Portfolio"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Provider/Platform</label>
                            <input
                                type="text"
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                placeholder="e.g. MMTC-PAMP"
                            />
                        </div>
                        <div className="form-group">
                            <label>Name of Investor</label>
                            <input
                                type="text"
                                value={formData.nameOfInvestor}
                                onChange={(e) => setFormData({ ...formData, nameOfInvestor: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Demat Account No.</label>
                            <input
                                type="text"
                                value={formData.dematAccountNumber}
                                onChange={(e) => setFormData({ ...formData, dematAccountNumber: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Sub Broker</label>
                            <input
                                type="text"
                                value={formData.subBroker}
                                onChange={(e) => setFormData({ ...formData, subBroker: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Login URL</label>
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="form-group">
                            <label>User ID</label>
                            <input
                                type="text"
                                value={formData.loginUserId}
                                onChange={(e) => setFormData({ ...formData, loginUserId: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="2"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (editData ? 'Update' : 'Add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GoldBondProfileModal;
