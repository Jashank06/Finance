import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiLock, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import financeLogo from '../assets/FinanceLogo.png';
import './Login.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP, 3 = new password
  const [userId, setUserId] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/otp/forgot-password-request`, {
        email
      });

      if (response.data.success) {
        setUserId(response.data.userId);
        setStep(2);
        setSuccess('Password reset code sent to your email! Please check your inbox.');
        startResendTimer();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    }

    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/otp/verify-reset-otp`, {
        userId,
        otp
      });

      if (response.data.success) {
        setStep(3);
        setSuccess('Code verified! Please enter your new password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
      setOtp('');
    }

    setLoading(false);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/otp/reset-password`, {
        userId,
        otp,
        newPassword
      });

      if (response.data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }

    setLoading(false);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/otp/resend-otp`, {
        userId,
        purpose: 'password_reset'
      });

      if (response.data.success) {
        setSuccess('Reset code resent successfully! Please check your email.');
        startResendTimer();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    }

    setLoading(false);
  };

  // Start 60 second countdown for resend button
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Go back to previous step
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp('');
    } else if (step === 3) {
      setStep(2);
      setNewPassword('');
      setConfirmPassword('');
    }
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-container">
      <Link to="/login" className="back-home-button">
        <FiArrowLeft />
        <span>Back to Login</span>
      </Link>

      {/* Left Side - Branding */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="brand-logo">
            <img src={financeLogo} alt="Finance Master" className="brand-logo-img" />
            <span className="brand-name">FinanceMaster</span>
          </div>

          <h1 className="branding-title">
            Reset Your Password
          </h1>

          <p className="branding-subtitle">
            Don't worry, we'll help you get back to managing your finances in no time.
          </p>

          <div className="branding-features">
            <div className="branding-feature">
              <div className="feature-icon-circle">
                <FiMail />
              </div>
              <span>Enter your email address</span>
            </div>

            <div className="branding-feature">
              <div className="feature-icon-circle">
                <FiLock />
              </div>
              <span>Verify with security code</span>
            </div>

            <div className="branding-feature">
              <div className="feature-icon-circle">
                <FiCheckCircle />
              </div>
              <span>Create a new password</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2 className="auth-title">
              {step === 1 && 'Forgot Password?'}
              {step === 2 && 'Verify Code'}
              {step === 3 && 'Create New Password'}
            </h2>
            <p className="auth-subtitle">
              {step === 1 && 'Enter your email to receive a password reset code.'}
              {step === 2 && 'Enter the 6-digit code sent to your email.'}
              {step === 3 && 'Enter your new password below.'}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="form-input"
                  autoFocus
                />
              </div>

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </button>

              <div className="auth-switch" style={{ marginTop: '1rem' }}>
                <span>Remember your password?</span>
                <Link to="/login" className="auth-switch-link">Login</Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="form-group">
                <label htmlFor="otp" className="form-label">
                  <FiMail style={{ display: 'inline', marginRight: '8px' }} />
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="Enter 6-digit code"
                  className="form-input otp-input"
                  maxLength="6"
                  autoComplete="off"
                  autoFocus
                />
                <p className="otp-helper-text">
                  Check your email for the verification code. It expires in 10 minutes.
                </p>
              </div>

              <div className="otp-actions">
                <button 
                  type="button" 
                  onClick={handleResendOTP} 
                  disabled={loading || resendTimer > 0}
                  className="resend-otp-button"
                >
                  <FiRefreshCw style={{ marginRight: '6px' }} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>

                <button 
                  type="button" 
                  onClick={handleBack}
                  className="back-to-login-button"
                >
                  Back
                </button>
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} className="auth-button">
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password (min 6 characters)"
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="form-input"
                />
              </div>

              <button 
                type="button" 
                onClick={handleBack}
                className="back-to-login-button"
                style={{ marginBottom: '1rem' }}
              >
                <FiArrowLeft style={{ marginRight: '6px' }} />
                Back
              </button>

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
