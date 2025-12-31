import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiHardDrive, FiCheck } from 'react-icons/fi';
import './AdminPages.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const SpaceRetailing = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        storageSize: 10,
        price: 0,
        currency: '₹',
        period: 'month',
        features: [''],
        isPopular: false,
        active: true,
        order: 0
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/space-plans/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlans(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching space plans:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            const filteredFeatures = formData.features.filter(f => f.trim() !== '');
            const dataToSend = { ...formData, features: filteredFeatures };

            if (editingPlan) {
                await axios.put(`${API_URL}/space-plans/${editingPlan._id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/space-plans`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            fetchPlans();
            closeModal();
            alert(editingPlan ? '✅ Space plan updated!' : '✅ Space plan created!');
        } catch (error) {
            console.error('Error saving space plan:', error);
            alert('❌ Error saving space plan');
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            description: plan.description || '',
            storageSize: plan.storageSize,
            price: plan.price,
            currency: plan.currency,
            period: plan.period,
            features: plan.features.length > 0 ? plan.features : [''],
            isPopular: plan.isPopular,
            active: plan.active,
            order: plan.order
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this space plan?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/space-plans/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPlans();
            alert('✅ Space plan deleted!');
        } catch (error) {
            console.error('Error deleting space plan:', error);
            alert('❌ Error deleting space plan');
        }
    };

    const toggleActive = async (plan) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/space-plans/${plan._id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPlans();
        } catch (error) {
            console.error('Error toggling plan status:', error);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPlan(null);
        setFormData({
            name: '',
            description: '',
            storageSize: 10,
            price: 0,
            currency: '₹',
            period: 'month',
            features: [''],
            isPopular: false,
            active: true,
            order: 0
        });
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const updateFeature = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#111827' }}>
                        Space Retailing
                    </h1>
                    <p style={{ color: '#6b7280' }}>Manage storage space plans for users</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    <FiPlus /> Add Space Plan
                </button>
            </div>

            {/* Plans Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '1.5rem' 
            }}>
                {plans.map(plan => (
                    <div key={plan._id} style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        border: plan.isPopular ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        position: 'relative'
                    }}>
                        {plan.isPopular && (
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                right: '20px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}>
                                POPULAR
                            </div>
                        )}

                        {/* Storage Icon */}
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                        }}>
                            <FiHardDrive style={{ fontSize: '24px', color: 'white' }} />
                        </div>

                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            {plan.name}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            {plan.description}
                        </p>

                        {/* Storage Size */}
                        <div style={{ 
                            background: '#f3f4f6', 
                            padding: '1rem', 
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                                {plan.storageSize} GB
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                Storage Space
                            </div>
                        </div>

                        {/* Price */}
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                                {plan.currency}{plan.price}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                /{plan.period === 'lifetime' ? 'lifetime' : plan.period}
                            </span>
                        </div>

                        {/* Features */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            {plan.features.map((feature, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <FiCheck style={{ color: '#10b981', fontSize: '16px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.9rem', color: '#374151' }}>{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Status & Actions */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '1rem',
                            borderTop: '1px solid #e5e7eb'
                        }}>
                            <button
                                onClick={() => toggleActive(plan)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    background: plan.active ? '#dcfce7' : '#f3f4f6',
                                    color: plan.active ? '#16a34a' : '#6b7280',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '500'
                                }}
                            >
                                {plan.active ? <FiToggleRight /> : <FiToggleLeft />}
                                {plan.active ? 'Active' : 'Inactive'}
                            </button>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleEdit(plan)}
                                    style={{
                                        padding: '0.5rem',
                                        background: '#dbeafe',
                                        color: '#2563eb',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    onClick={() => handleDelete(plan._id)}
                                    style={{
                                        padding: '0.5rem',
                                        background: '#fee2e2',
                                        color: '#dc2626',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {plans.length === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '4rem 2rem',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    <FiHardDrive style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                        No Space Plans Yet
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                        Create your first storage space plan to get started
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        <FiPlus style={{ marginRight: '0.5rem' }} /> Create First Plan
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '2rem'
                    }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
                            {editingPlan ? 'Edit Space Plan' : 'Create New Space Plan'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Plan Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        rows="3"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                            Storage Size (GB) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.storageSize}
                                            onChange={(e) => setFormData({ ...formData, storageSize: parseFloat(e.target.value) })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                            required
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                            Price *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Period *
                                    </label>
                                    <select
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                    >
                                        <option value="month">Monthly</option>
                                        <option value="year">Yearly</option>
                                        <option value="lifetime">Lifetime</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Features
                                    </label>
                                    {formData.features.map((feature, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateFeature(index, e.target.value)}
                                                style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                                placeholder="Feature description"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                style={{
                                                    padding: '0.75rem',
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#f3f4f6',
                                            color: '#374151',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <FiPlus style={{ marginRight: '0.5rem' }} /> Add Feature
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isPopular}
                                            onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                                        />
                                        <span>Mark as Popular</span>
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        />
                                        <span>Active</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        padding: '0.75rem 2rem',
                                        background: '#f3f4f6',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpaceRetailing;
