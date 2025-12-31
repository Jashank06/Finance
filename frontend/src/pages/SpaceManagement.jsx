import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiHardDrive, FiCheck, FiShoppingCart, FiDatabase, FiPackage } from 'react-icons/fi';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const SpaceManagement = () => {
    const [plans, setPlans] = useState([]);
    const [storageInfo, setStorageInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        fetchPlans();
        fetchStorageInfo();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await axios.get(`${API_URL}/space-plans`);
            setPlans(response.data);
        } catch (error) {
            console.error('Error fetching space plans:', error);
        }
    };

    const fetchStorageInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/space-plans/user/storage`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStorageInfo(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching storage info:', error);
            setLoading(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePurchase = async (plan) => {
        setPurchasing(true);

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                alert('❌ Failed to load payment gateway. Please try again.');
                setPurchasing(false);
                return;
            }

            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            // Create order
            const orderResponse = await axios.post(`${API_URL}/payment/create-order`, {
                planId: plan._id,
                amount: plan.price,
                planType: 'space',
                email: user.email,
                name: user.name,
                contact: user.mobile || ''
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { order, razorpayKeyId } = orderResponse.data;

            const options = {
                key: razorpayKeyId,
                amount: order.amount,
                currency: order.currency,
                name: 'Finance App - Space Management',
                description: `${plan.name} - ${plan.storageSize}GB Storage`,
                order_id: order.id,
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.mobile || ''
                },
                theme: {
                    color: '#3b82f6'
                },
                handler: async function (response) {
                    try {
                        // Verify payment and add storage
                        const verifyResponse = await axios.post(`${API_URL}/payment/verify-space-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: plan._id
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (verifyResponse.data.success) {
                            alert('✅ Space plan purchased successfully!');
                            fetchStorageInfo();
                        } else {
                            alert('❌ Payment verification failed. Please contact support.');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        alert('❌ Payment verification failed. Please contact support.');
                    }
                    setPurchasing(false);
                },
                modal: {
                    ondismiss: function () {
                        setPurchasing(false);
                        alert('Payment cancelled. Please try again.');
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('❌ Error initiating payment: ' + (error.response?.data?.message || error.message));
            setPurchasing(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Lifetime';
        return new Date(date).toLocaleDateString('en-IN');
    };

    const getStoragePercentage = () => {
        if (!storageInfo) return 0;
        return (storageInfo.usedStorage / storageInfo.totalStorage) * 100;
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading storage information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container" style={{ 
            minHeight: '100vh',
            background: '#f8f9fa',
            padding: '2rem'
        }}>
            {/* Hero Header with Glass Morphism */}
            <div style={{
                background: 'rgba(0, 0, 0, 0.03)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '20px',
                padding: '3rem 2rem',
                marginBottom: '3rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                transform: 'translateY(0)',
                transition: 'transform 0.3s ease'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '20px',
                    marginBottom: '1.5rem',
                    animation: 'float 3s ease-in-out infinite',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                    <FiHardDrive style={{ fontSize: '3rem', color: '#000000' }} />
                </div>
                <h1 style={{ 
                    fontSize: '3rem', 
                    fontWeight: '800', 
                    margin: 0,
                    color: '#000000',
                    textShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    letterSpacing: '-1px'
                }}>
                    Space Management
                </h1>
                <p style={{ 
                    margin: '1rem 0 0 0', 
                    fontSize: '1.2rem',
                    color: 'rgba(0, 0, 0, 0.6)'
                }}>
                    Upgrade your storage with our premium plans
                </p>
            </div>

            {/* Available Plans with 3D Cards */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                <h2 style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    marginBottom: '2rem',
                    color: '#000000',
                    textAlign: 'center',
                    textShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                    <FiShoppingCart style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Available Storage Plans
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '2rem'
                }}>
                    {plans.map(plan => (
                        <div key={plan._id} style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: plan.isPopular 
                                ? '2px solid rgba(0, 0, 0, 0.2)' 
                                : '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '20px',
                            padding: '2rem',
                            position: 'relative',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                            transform: 'perspective(1000px) rotateY(0deg)',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'perspective(1000px) translateY(-10px) rotateY(5deg) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 20px 60px 0 rgba(0, 0, 0, 0.15)';
                            e.currentTarget.style.border = plan.isPopular 
                                ? '2px solid rgba(0, 0, 0, 0.3)' 
                                : '1px solid rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) scale(1)';
                            e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.border = plan.isPopular 
                                ? '2px solid rgba(0, 0, 0, 0.2)' 
                                : '1px solid rgba(0, 0, 0, 0.1)';
                        }}
                        >
                            {plan.isPopular && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    right: '20px',
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    color: 'white',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
                                    letterSpacing: '1px'
                                }}>
                                    ⭐ POPULAR
                                </div>
                            )}

                            {/* Icon */}
                            <div style={{
                                width: '70px',
                                height: '70px',
                                background: 'rgba(0, 0, 0, 0.05)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                                <FiHardDrive style={{ fontSize: '36px', color: '#000000' }} />
                            </div>

                            <h3 style={{ 
                                fontSize: '1.8rem', 
                                fontWeight: '800', 
                                marginBottom: '0.5rem',
                                color: '#000000',
                                textShadow: '0 2px 10px rgba(0,0,0,0.05)'
                            }}>
                                {plan.name}
                            </h3>
                            <p style={{ 
                                color: 'rgba(0, 0, 0, 0.6)', 
                                fontSize: '0.95rem', 
                                marginBottom: '1.5rem', 
                                minHeight: '40px',
                                lineHeight: '1.5'
                            }}>
                                {plan.description}
                            </p>

                            {/* Storage */}
                            <div style={{
                                background: 'rgba(0, 0, 0, 0.05)',
                                backdropFilter: 'blur(5px)',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                marginBottom: '1.5rem',
                                textAlign: 'center',
                                border: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{ 
                                    fontSize: '3rem', 
                                    fontWeight: '800', 
                                    color: '#000000',
                                    textShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
                                    marginBottom: '0.25rem'
                                }}>
                                    {plan.storageSize} GB
                                </div>
                                <div style={{ 
                                    fontSize: '0.9rem', 
                                    color: 'rgba(0, 0, 0, 0.6)',
                                    fontWeight: '500'
                                }}>
                                    Storage Space
                                </div>
                            </div>

                            {/* Price */}
                            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                <div>
                                    <span style={{ 
                                        fontSize: '3rem', 
                                        fontWeight: '800', 
                                        color: '#000000',
                                        textShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                    }}>
                                        {plan.currency}{plan.price}
                                    </span>
                                </div>
                                <span style={{ 
                                    color: 'rgba(0, 0, 0, 0.6)', 
                                    fontSize: '1rem',
                                    fontWeight: '500'
                                }}>
                                    /{plan.period === 'lifetime' ? 'lifetime' : plan.period}
                                </span>
                            </div>

                            {/* Features */}
                            <div style={{ marginBottom: '2rem' }}>
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        marginBottom: '0.75rem',
                                        padding: '0.5rem',
                                        background: 'rgba(0, 0, 0, 0.03)',
                                        borderRadius: '10px'
                                    }}>
                                        <div style={{
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            borderRadius: '50%',
                                            padding: '0.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FiCheck style={{ color: '#10b981', fontSize: '18px' }} />
                                        </div>
                                        <span style={{ 
                                            fontSize: '0.95rem', 
                                            color: 'rgba(0, 0, 0, 0.8)',
                                            fontWeight: '500'
                                        }}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Purchase Button */}
                            <button
                                onClick={() => handlePurchase(plan)}
                                disabled={purchasing}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    background: purchasing 
                                        ? 'rgba(156, 163, 175, 0.3)' 
                                        : 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    border: '2px solid rgba(0, 0, 0, 0.1)',
                                    borderRadius: '15px',
                                    fontWeight: '700',
                                    cursor: purchasing ? 'not-allowed' : 'pointer',
                                    fontSize: '1.1rem',
                                    transition: 'all 0.3s ease',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    if (!purchasing) {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)';
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!purchasing) {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
                                    }
                                }}
                            >
                                {purchasing ? '⏳ Processing...' : '🚀 Purchase Now'}
                            </button>
                        </div>
                    ))}
                </div>

                {plans.length === 0 && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '4rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <FiHardDrive style={{ 
                            fontSize: '4rem', 
                            marginBottom: '1rem',
                            color: 'rgba(0, 0, 0, 0.3)'
                        }} />
                        <p style={{ 
                            color: 'rgba(0, 0, 0, 0.6)',
                            fontSize: '1.2rem',
                            fontWeight: '500'
                        }}>
                            No storage plans available at the moment.
                        </p>
                    </div>
                )}
            </div>

            {/* Add floating animation keyframe */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
            `}</style>
        </div>
    );
};

export default SpaceManagement;
