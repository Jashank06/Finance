import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import axios from 'axios';
import PaymentModal from '../../components/PaymentModal';
import './PricingPage.css';
import './NewSections.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const PricingPage = () => {
    const navigate = useNavigate();
    const [pricingPlans, setPricingPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        fetchPricingPlans();
    }, []);

    const fetchPricingPlans = async () => {
        try {
            const response = await axios.get(`${API_URL}/subscription-plans/public`);
            const sortedPlans = response.data.sort((a, b) => a.price - b.price);
            setPricingPlans(sortedPlans);
        } catch (error) {
            console.error('Error fetching pricing plans:', error);
        } finally {
            setLoadingPlans(false);
        }
    };

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = (user) => {
        setShowPaymentModal(false);
        setSelectedPlan(null);
        navigate('/payment-success');
    };

    return (
        <div className="pricing-page">
            {/* Hero Section */}
            <section className="pricing-hero-section">
                <div className="pricing-hero-overlay"></div>
                <div className="container">
                    <div className="pricing-hero-content">
                        <span className="section-label">PRICING PLANS</span>
                        <h1 className="pricing-hero-title">
                            Choose Your Perfect Plan
                        </h1>
                        <p className="pricing-hero-description">
                            Simple, transparent pricing for families of all sizes. Start with a free trial and upgrade anytime.
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Cards Section */}
            <section className="pricing-cards-section">
                <div className="container">
                    <div className="pricing-grid">
                        {loadingPlans ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                                <div className="loader"></div>
                                <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.7)' }}>Loading pricing plans...</p>
                            </div>
                        ) : pricingPlans.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.7)' }}>
                                No pricing plans available at the moment
                            </div>
                        ) : (
                            pricingPlans.map((plan, index) => (
                                <div
                                    key={plan._id}
                                    className={`pricing-card ${plan.isPopular ? 'featured' : ''} animate-fade-in delay-${index + 1}`}
                                >
                                    {plan.isPopular && <div className="pricing-badge">MOST POPULAR</div>}
                                    <div className="pricing-tag">{plan.tagline || plan.name}</div>
                                    <div className="pricing-amount">
                                        <span className="currency">₹</span>
                                        <span className="price">{plan.price}</span>
                                        <span className="period">/{plan.duration}</span>
                                    </div>
                                    <ul className="pricing-features">
                                        {plan.features && plan.features.map((feature, idx) => (
                                            <li key={idx}>
                                                <FiCheck className="check-icon" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        {plan.featureCategories && plan.featureCategories.length > 0 && (
                                            <>
                                                {plan.featureCategories.map((catId, idx) => {
                                                    const categoryNames = {
                                                        'daily_finance': 'Daily Finance Management',
                                                        'monitoring': 'Monitoring & Planning',
                                                        'investments': 'Investment Management',
                                                        'static_data': 'Static Data & Records',
                                                        'reports_analytics': 'Reports & Analytics',
                                                        'family_management': 'Family Management'
                                                    };
                                                    return (
                                                        <li key={`cat-${idx}`}>
                                                            <FiCheck className="check-icon" />
                                                            <span>{categoryNames[catId]}</span>
                                                        </li>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </ul>
                                    <button 
                                        className={`pricing-btn ${plan.isPopular ? 'featured-btn' : ''}`}
                                        onClick={() => handlePlanSelect(plan)}
                                    >
                                        {plan.buttonText || 'Get Started'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Features Comparison Section */}
            <section className="pricing-features-comparison">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">DETAILED COMPARISON</span>
                        <h2 className="section-title">Compare All Features</h2>
                        <p className="section-description">
                            See what's included in each plan to make the right choice for your family
                        </p>
                    </div>
                    
                    <div className="comparison-note">
                        <p>
                            ✓ All plans include secure data storage, mobile access, and regular updates<br/>
                            ✓ 30-day money-back guarantee on all paid plans<br/>
                            ✓ Cancel anytime, no questions asked
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="pricing-faq-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">HAVE QUESTIONS?</span>
                        <h2 className="section-title">Frequently Asked Questions</h2>
                    </div>

                    <div className="faq-grid">
                        <div className="faq-item">
                            <h3 className="faq-question">Can I change plans later?</h3>
                            <p className="faq-answer">
                                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                            </p>
                        </div>

                        <div className="faq-item">
                            <h3 className="faq-question">What payment methods do you accept?</h3>
                            <p className="faq-answer">
                                We accept all major credit cards, debit cards, UPI, net banking, and digital wallets through our secure payment partner Razorpay.
                            </p>
                        </div>

                        <div className="faq-item">
                            <h3 className="faq-question">Is there a free trial?</h3>
                            <p className="faq-answer">
                                Yes! Some plans come with a free trial period. You can explore all features before committing to a paid plan.
                            </p>
                        </div>

                        <div className="faq-item">
                            <h3 className="faq-question">Can I cancel my subscription?</h3>
                            <p className="faq-answer">
                                Yes, you can cancel your subscription at any time. Your data will remain accessible for 30 days after cancellation.
                            </p>
                        </div>

                        <div className="faq-item">
                            <h3 className="faq-question">Is my data secure?</h3>
                            <p className="faq-answer">
                                Absolutely! We use bank-level encryption and security measures to protect your financial data. Your information is never shared with third parties.
                            </p>
                        </div>

                        <div className="faq-item">
                            <h3 className="faq-question">Do you offer refunds?</h3>
                            <p className="faq-answer">
                                Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund within 30 days of purchase.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="pricing-cta-section">
                <div className="container">
                    <div className="pricing-cta-content">
                        <h2 className="pricing-cta-title">Ready to Get Started?</h2>
                        <p className="pricing-cta-description">
                            Join thousands of families managing their finances smarter
                        </p>
                        <button 
                            className="pricing-cta-btn"
                            onClick={() => {
                                const element = document.querySelector('.pricing-cards-section');
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                        >
                            View Plans
                        </button>
                    </div>
                </div>
            </section>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlan && (
                <PaymentModal
                    plan={selectedPlan}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedPlan(null);
                    }}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default PricingPage;
