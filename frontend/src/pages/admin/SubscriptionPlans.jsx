import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import './AdminPages.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Feature Categories
const FEATURE_CATEGORIES = [
    { id: 'daily_finance', name: 'Daily Finance Management', description: 'Cash, Cards, Bank & Daily Transactions' },
    { id: 'monitoring', name: 'Monitoring & Planning', description: 'Budget, Calendar, Reminders & Targets' },
    { id: 'investments', name: 'Investment Management', description: 'MF, Shares, Gold, Insurance & Tracking' },
    { id: 'static_data', name: 'Static Data & Records', description: 'Family Profile, Documents & Inventory' },
    { id: 'reports_analytics', name: 'Reports & Analytics', description: 'Financial Reports & Data Analysis' },
    { id: 'family_management', name: 'Family Management', description: 'Family Profile & Task Management' }
];

const SubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        price: 0,
        currency: '₹',
        period: 'month',
        features: [''],
        featureCategories: ['daily_finance', 'static_data'], // Default basic features
        isPopular: false,
        isFeatured: false,
        buttonText: 'Get Started',
        buttonLink: '/signup',
        order: 0,
        active: true,
        maxMembers: null,
        description: ''
    });
    
    // Coupon management states
    const [showCouponSection, setShowCouponSection] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [selectedPlanForCoupon, setSelectedPlanForCoupon] = useState(null);
    const [couponForm, setCouponForm] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        subscriptionPlan: null,
        maxUses: null,
        validUntil: '',
        minPurchaseAmount: 0
    });

    useEffect(() => {
        fetchPlans();
        fetchCoupons();
    }, []);

    const fetchPlans = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/subscription-plans`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlans(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching plans:', error);
            setLoading(false);
        }
    };
    
    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/coupons`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(response.data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }
    };
    
    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const couponData = {
                ...couponForm,
                subscriptionPlan: selectedPlanForCoupon
            };
            
            await axios.post(`${API_URL}/coupons`, couponData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('✅ Coupon created successfully!');
            setCouponForm({
                code: '',
                description: '',
                discountType: 'percentage',
                discountValue: 0,
                subscriptionPlan: null,
                maxUses: null,
                validUntil: '',
                minPurchaseAmount: 0
            });
            setSelectedPlanForCoupon(null);
            setShowCouponSection(false); // Close the form
            fetchCoupons();
        } catch (error) {
            console.error('Error creating coupon:', error);
            alert('❌ Error creating coupon: ' + (error.response?.data?.message || error.message));
        }
    };
    
    const handleDeleteCoupon = async (couponId) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/coupons/${couponId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Coupon deleted successfully!');
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            alert('❌ Error deleting coupon');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            const filteredFeatures = formData.features.filter(f => f.trim() !== '');
            const filteredCategories = formData.featureCategories || ['daily_finance', 'static_data'];
            const dataToSend = { 
                ...formData, 
                features: filteredFeatures,
                featureCategories: filteredCategories
            };

            if (editingPlan) {
                await axios.put(`${API_URL}/subscription-plans/${editingPlan._id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/subscription-plans`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            fetchPlans();
            closeModal();
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Error saving plan');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this plan?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/subscription-plans/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPlans();
        } catch (error) {
            console.error('Error deleting plan:', error);
            alert('Error deleting plan');
        }
    };

    const toggleActive = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/subscription-plans/${id}/toggle-active`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPlans();
        } catch (error) {
            console.error('Error toggling plan status:', error);
        }
    };

    const openModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                ...plan,
                features: plan.features.length > 0 ? plan.features : [''],
                featureCategories: plan.featureCategories || ['daily_finance', 'static_data']
            });
        } else {
            setEditingPlan(null);
            setFormData({
                name: '',
                tagline: '',
                price: 0,
                currency: '₹',
                period: 'month',
                features: [''],
                featureCategories: ['daily_finance', 'static_data'],
                isPopular: false,
                isFeatured: false,
                buttonText: 'Get Started',
                buttonLink: '/signup',
                order: 0,
                active: true,
                maxMembers: null,
                description: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPlan(null);
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const updateFeature = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const toggleFeatureCategory = (categoryId) => {
        const currentCategories = formData.featureCategories || [];
        if (currentCategories.includes(categoryId)) {
            // Remove category
            setFormData({ 
                ...formData, 
                featureCategories: currentCategories.filter(id => id !== categoryId) 
            });
        } else {
            // Add category
            setFormData({ 
                ...formData, 
                featureCategories: [...currentCategories, categoryId] 
            });
        }
    };

    if (loading) {
        return <div className="admin-loading">Loading plans...</div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Subscription Plans</h1>
                    <p>Manage pricing plans displayed on homepage</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    style={{
                        background: 'linear-gradient(145deg, #1f2937, #111827) !important',
                        backgroundColor: '#1f2937 !important',
                        color: 'white !important',
                        padding: '0.875rem 1.5rem',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 8px 15px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15), 0 12px 20px rgba(0, 0, 0, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 8px 15px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(1px)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15), 0 12px 20px rgba(0, 0, 0, 0.25)';
                    }}
                >
                    <FiPlus /> Create New Plan
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                marginTop: '2rem'
            }}>
                {plans.map((plan) => (
                    <div key={plan._id} style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: plan.isPopular ? '0 10px 40px rgba(16,185,129,0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
                        border: plan.isPopular ? '3px solid #10b981' : '1px solid #e5e7eb',
                        position: 'relative',
                        opacity: plan.active ? 1 : 0.6
                    }}>
                        {plan.isPopular && (
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                right: '20px',
                                background: '#10b981',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                            }}>
                                MOST POPULAR
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                {plan.tagline || plan.name}
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{ fontSize: '3rem', fontWeight: '700', color: '#1f2937' }}>
                                    {plan.currency}{plan.price}
                                </span>
                                <span style={{ color: '#6b7280', fontSize: '1rem' }}>
                                    /{plan.period}
                                </span>
                            </div>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', minHeight: '200px' }}>
                            {plan.features.map((feature, idx) => (
                                <li key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '0.75rem',
                                    color: '#374151',
                                    fontSize: '0.875rem'
                                }}>
                                    <FiCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                                    {feature}
                                </li>
                            ))}
                            {plan.featureCategories && plan.featureCategories.length > 0 && (
                                <>
                                    <li style={{ 
                                        marginTop: '1rem', 
                                        paddingTop: '1rem', 
                                        borderTop: '1px solid #e5e7eb',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        fontSize: '0.875rem'
                                    }}>
                                        Enabled Features:
                                    </li>
                                    {plan.featureCategories.map((catId, idx) => {
                                        const category = FEATURE_CATEGORIES.find(c => c.id === catId);
                                        return category ? (
                                            <li key={`cat-${idx}`} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                marginBottom: '0.5rem',
                                                color: '#10b981',
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }}>
                                                <FiCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                                                {category.name}
                                            </li>
                                        ) : null;
                                    })}
                                </>
                            )}
                        </ul>

                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <button
                                    onClick={() => openModal(plan)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: '#1f2937',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FiEdit2 size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(plan._id)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        background: '#fee',
                                        color: '#dc2626',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                            <button
                                onClick={() => toggleActive(plan._id)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: plan.active ? '#10b981' : '#9ca3af',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {plan.active ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                {plan.active ? 'Active' : 'Inactive'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>
                            {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Plan Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tagline *</label>
                                    <input
                                        type="text"
                                        value={formData.tagline}
                                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price *</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Period</label>
                                        <select
                                            value={formData.period}
                                            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        >
                                            <option value="month">Month</option>
                                            <option value="year">Year</option>
                                            <option value="lifetime">Lifetime</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Features *</label>
                                    {formData.features.map((feature, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateFeature(index, e.target.value)}
                                                placeholder="Enter feature"
                                                style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                style={{ padding: '0.75rem', background: '#fee', color: '#dc2626', border: 'none', borderRadius: '8px' }}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        <FiPlus /> Add Feature
                                    </button>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '1rem', color: '#1f2937' }}>
                                        Feature Access Control *
                                    </label>
                                    <div style={{ 
                                        background: '#f9fafb', 
                                        padding: '1rem', 
                                        borderRadius: '8px', 
                                        border: '1px solid #e5e7eb',
                                        display: 'grid',
                                        gap: '0.75rem'
                                    }}>
                                        {FEATURE_CATEGORIES.map((category) => (
                                            <label 
                                                key={category.id}
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'start', 
                                                    gap: '0.75rem', 
                                                    cursor: 'pointer',
                                                    padding: '0.75rem',
                                                    background: 'white',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.featureCategories?.includes(category.id) || false}
                                                    onChange={() => toggleFeatureCategory(category.id)}
                                                    style={{ 
                                                        marginTop: '0.25rem',
                                                        width: '18px',
                                                        height: '18px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                                                        {category.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                        {category.description}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                        ℹ️ Select which features users can access with this plan
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.isPopular}
                                                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                                            />
                                            <span>Mark as Popular</span>
                                        </label>
                                    </div>
                                    <div>
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

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Order (Display Order)</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: '#10b981',
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

            {/* Coupon Management Section */}
            <div style={{ marginTop: '3rem' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                        Coupon Management
                    </h2>
                    <button
                        onClick={() => setShowCouponSection(!showCouponSection)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FiPlus /> {showCouponSection ? 'Hide' : 'Create Coupon'}
                    </button>
                </div>

                {/* Coupon Creation Form */}
                {showCouponSection && (
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
                            Create New Coupon
                        </h3>
                        <form onSubmit={handleCouponSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Coupon Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={couponForm.code}
                                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g., NEWYEAR2025"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Plan (Optional)
                                    </label>
                                    <select
                                        value={selectedPlanForCoupon || ''}
                                        onChange={(e) => setSelectedPlanForCoupon(e.target.value || null)}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    >
                                        <option value="">All Plans</option>
                                        {plans.map(plan => (
                                            <option key={plan._id} value={plan._id}>{plan.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Discount Type *
                                    </label>
                                    <select
                                        value={couponForm.discountType}
                                        onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        value={couponForm.discountValue}
                                        onChange={(e) => setCouponForm({ ...couponForm, discountValue: parseFloat(e.target.value) })}
                                        placeholder={couponForm.discountType === 'percentage' ? 'e.g., 10' : 'e.g., 100'}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Valid Until *
                                    </label>
                                    <input
                                        type="date"
                                        value={couponForm.validUntil}
                                        onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Max Uses (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        value={couponForm.maxUses || ''}
                                        onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                                        placeholder="Unlimited"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Description
                                    </label>
                                    <textarea
                                        value={couponForm.description}
                                        onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                                        placeholder="Coupon description..."
                                        rows="3"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    marginTop: '1.5rem',
                                    padding: '0.75rem 2rem',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Create Coupon
                            </button>
                        </form>
                    </div>
                )}

                {/* Coupons List */}
                <div style={{ 
                    background: 'white', 
                    padding: '2rem', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
                        Active Coupons ({coupons.length})
                    </h3>
                    
                    {coupons.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                            No coupons created yet. Create your first coupon above!
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {coupons.map(coupon => (
                                <div key={coupon._id} style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{
                                                background: '#10b981',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '6px',
                                                fontWeight: '700',
                                                fontSize: '1.1rem'
                                            }}>
                                                {coupon.code}
                                            </span>
                                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                                {coupon.discountType === 'percentage' 
                                                    ? `${coupon.discountValue}% OFF` 
                                                    : `₹${coupon.discountValue} OFF`
                                                }
                                            </span>
                                            {coupon.subscriptionPlan && (
                                                <span style={{
                                                    background: '#dbeafe',
                                                    color: '#1e40af',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {coupon.subscriptionPlan.name}
                                                </span>
                                            )}
                                        </div>
                                        {coupon.description && (
                                            <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>{coupon.description}</p>
                                        )}
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#9ca3af' }}>
                                            <span>Valid until: {new Date(coupon.validUntil).toLocaleDateString()}</span>
                                            {coupon.maxUses && <span>Max uses: {coupon.maxUses} | Used: {coupon.usedCount}</span>}
                                            {!coupon.maxUses && <span>Used: {coupon.usedCount} times</span>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCoupon(coupon._id)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <FiTrash2 /> Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlans;
