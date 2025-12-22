import { FiCheck, FiPlus } from 'react-icons/fi';
import '../investments/Investment.css';

const SubscriptionPlans = () => {
    const plans = [
        {
            name: 'Basic',
            price: '₹299',
            period: '/month',
            features: ['5 GB Storage', 'Basic Analytics', 'Email Support', '1 User'],
            color: '#3b82f6',
            popular: false
        },
        {
            name: 'Pro',
            price: '₹599',
            period: '/month',
            features: ['50 GB Storage', 'Advanced Analytics', 'Priority Support', '5 Users', 'API Access'],
            color: '#8b5cf6',
            popular: true
        },
        {
            name: 'Premium',
            price: '₹999',
            period: '/month',
            features: ['Unlimited Storage', 'Real-time Analytics', '24/7 Support', 'Unlimited Users', 'API Access', 'Custom Features'],
            color: '#10b981',
            popular: false
        }
    ];

    return (
        <div className="investment-container">
            <div className="investment-header">
                <h1>Subscription Plans</h1>
                <p>Manage pricing and features for all plans</p>
            </div>

            <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
                <button className="add-button">
                    <FiPlus /> Create New Plan
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {plans.map((plan, index) => (
                    <div key={index} style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: plan.popular ? '0 10px 40px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
                        border: plan.popular ? `3px solid ${plan.color}` : '1px solid #e5e7eb',
                        position: 'relative',
                        transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.2s'
                    }}>
                        {plan.popular && (
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                right: '20px',
                                background: plan.color,
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                            }}>
                                Most Popular
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', color: plan.color, marginBottom: '1rem' }}>
                                {plan.name}
                            </h3>
                            <div>
                                <span style={{ fontSize: '3rem', fontWeight: '700', color: '#1f2937' }}>
                                    {plan.price}
                                </span>
                                <span style={{ color: '#6b7280', fontSize: '1rem' }}>
                                    {plan.period}
                                </span>
                            </div>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                            {plan.features.map((feature, idx) => (
                                <li key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '1rem',
                                    color: '#374151'
                                }}>
                                    <div style={{
                                        background: `${plan.color}15`,
                                        borderRadius: '50%',
                                        padding: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FiCheck size={16} color={plan.color} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: plan.color,
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}>
                                Edit Plan
                            </button>
                            <button style={{
                                padding: '0.75rem 1rem',
                                background: '#fee',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPlans;
