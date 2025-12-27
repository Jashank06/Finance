import { useState } from 'react';
import axios from 'axios';
import './Modal.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const PaymentModal = ({ plan, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!/^\d{10}$/.test(formData.contact)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      const orderResponse = await axios.post(`${API_URL}/payment/create-order`, {
        planId: plan._id,
        email: formData.email,
        name: formData.name,
        contact: formData.contact
      });

      const { order, razorpayKeyId } = orderResponse.data;

      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Finance App',
        description: `${plan.name} Plan Subscription`,
        order_id: order.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.contact
        },
        theme: {
          color: '#10b981'
        },
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(`${API_URL}/payment/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userData: {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                contact: formData.contact
              }
            });

            if (verifyResponse.data.success) {
              onSuccess(verifyResponse.data.user);
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed. Please contact support.');
          }
          setLoading(false);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled. Please try again.');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Error initiating payment. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.875rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: 'white',
    transition: 'all 0.3s',
    outline: 'none',
    backdropFilter: 'blur(10px)',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)'
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 9999
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '1000px',
          width: '95%',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(30px)',
          borderRadius: '30px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2))',
          backdropFilter: 'blur(20px)',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: 'white',
              marginBottom: '0.25rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              Subscribe to {plan.name}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
              Complete registration to unlock features
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(16, 185, 129, 0.15)',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Total Amount
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>
                {plan.currency}{plan.price}<span style={{ fontSize: '0.9rem', fontWeight: '500' }}>/{plan.period}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                color: 'white',
                fontSize: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              padding: '0.875rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              backdropFilter: 'blur(10px)',
              color: '#fca5a5',
              borderRadius: '12px',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} placeholder="John Doe" />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="john@example.com" />
              </div>

              {/* Mobile */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Mobile <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="tel" name="contact" value={formData.contact} onChange={handleChange} required pattern="[0-9]{10}" style={inputStyle} placeholder="9876543210" />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" style={inputStyle} placeholder="Min 6 characters" />
              </div>

              {/* Confirm Password */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength="6" style={inputStyle} placeholder="Re-enter password" />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: loading ? 'rgba(156, 163, 175, 0.3)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 10px 25px rgba(16, 185, 129, 0.3), 0 4px 6px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s',
                  transform: 'translateY(0)'
                }}
              >
                {loading ? '⏳ Processing...' : `🔒 Pay ${plan.currency}${plan.price} Securely`}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '1rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s'
                }}
              >
                Cancel
              </button>
            </div>

            {/* Security Badge */}
            <div style={{
              marginTop: '1.25rem',
              padding: '0.875rem',
              background: 'rgba(16, 185, 129, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🔒</span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(16, 185, 129, 0.9)', fontWeight: '600' }}>
                Secure Payment • SSL Encrypted • Powered by Razorpay
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
