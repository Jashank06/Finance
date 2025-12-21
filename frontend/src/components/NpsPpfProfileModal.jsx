import { useState, useEffect } from 'react';
import { investmentProfileAPI } from '../utils/investmentProfileAPI';
import { FiX } from 'react-icons/fi';

const NpsPpfProfileModal = ({ isOpen, onClose, onSuccess, editData }) => {
    const [formData, setFormData] = useState({
        name: '',
        accountNumber: '',
        subBroker: '',
        nameOfInvestor: '',
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
                accountNumber: editData.accountNumber || '',
                subBroker: editData.subBroker || '',
                nameOfInvestor: editData.nameOfInvestor || '',
                url: editData.url || '',
                loginUserId: editData.loginUserId || '',
                password: editData.password || '',
                notes: editData.notes || ''
            });
        } else {
            setFormData({
                name: '',
                accountNumber: '',
                subBroker: '',
                nameOfInvestor: '',
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
                await investmentProfileAPI.updateNpsPpf(editData._id, formData);
            } else {
                await investmentProfileAPI.createNpsPpf(formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving NPS/PPF profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{editData ? 'Edit NPS/PPF Profile' : 'Add NPS/PPF Profile'}</h2>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Name (Description) *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. My NPS Account"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Account Number</label>
                            <input
                                type="text"
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="PRAN / PPF Account No."
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
                            <label>Sub Broker</label>
                            <input
                                type="text"
                                value={formData.subBroker}
                                onChange={(e) => setFormData({ ...formData, subBroker: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Login URL</label>
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>User ID</label>
                            <input
                                type="text"
                                value={formData.loginUserId}
                                onChange={(e) => setFormData({ ...formData, loginUserId: e.target.value })}
                            />
                        </div>
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

export default NpsPpfProfileModal;
