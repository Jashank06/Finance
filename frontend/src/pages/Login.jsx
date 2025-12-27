import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiTrendingUp, FiShield, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiMail, FiRefreshCw } from 'react-icons/fi';
import financeLogo from '../assets/FinanceLogo.png';
import './Login.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = email/password, 2 = OTP
  const [userId, setUserId] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/otp/login-request`, {
        email,
        password
      });

      if (response.data.success) {
        setUserId(response.data.userId);
        setStep(2);
        setSuccess('OTP sent to your email! Please check your inbox.');
        startResendTimer();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }

    setLoading(false);
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/otp/verify-login-otp`, {
        userId,
        otp
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);

        setSuccess('Login successful! Redirecting...');
        
        // Redirect based on role
        setTimeout(() => {
          if (response.data.user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp('');
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
        purpose: 'login'
      });

      if (response.data.success) {
        setSuccess('OTP resent successfully! Please check your email.');
        startResendTimer();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
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

  // Go back to email/password step
  const handleBackToLogin = () => {
    setStep(1);
    setOtp('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-container">
      <Link to="/landing" className="back-home-button">
        <FiArrowLeft />
        <span>Back to Home</span>
      </Link>

      {/* Left Side - Branding */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="brand-logo">
            <img src={financeLogo} alt="Finance Master" className="brand-logo-img" />
            <span className="brand-name">FinanceMaster</span>
          </div>

          <h1 className="branding-title">
            Family-First Finance,<br />
            Built for Real Life.
          </h1>

          <p className="branding-subtitle">
            Join 50,000+ families who have taken control of their financial lives with one unified platform.
          </p>

          <div className="branding-features">
            <div className="branding-feature">
              <div className="feature-icon-circle">
                <FiUsers />
              </div>
              <span>Manage entire family finances in one place</span>
            </div>

            <div className="branding-feature">
              <div className="feature-icon-circle">
                <FiTrendingUp />
              </div>
              <span>Track investments & grow wealth together</span>
            </div>

            <div className="branding-feature">
              <div className="feature-icon-circle">
                <FiShield />
              </div>
              <span>Bank-grade security for peace of mind</span>
            </div>

            <div className="branding-feature">
              <div className="feature-icon-circle">
                <FiLock />
              </div>
              <span>Private profiles for each family member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2 className="auth-title">{step === 1 ? 'Welcome back' : 'Verify OTP'}</h2>
            <p className="auth-subtitle">
              {step === 1 
                ? 'Log in to continue managing your finances.' 
                : 'Enter the 6-digit code sent to your email.'}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-footer">
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
          ) : (
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
                placeholder="Enter 6-digit OTP"
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
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>

              <button 
                type="button" 
                onClick={handleBackToLogin}
                className="back-to-login-button"
              >
                Back to Login
              </button>
            </div>

            <button type="submit" disabled={loading || otp.length !== 6} className="auth-button">
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
          )}

          <div className="auth-switch">
            <span>Don't have an account?</span>
            <Link to="/signup" className="auth-switch-link">Sign up</Link>
          </div>

          <p className="demo-credentials">
            <strong>Demo:</strong> email: demo@example.com, password: demo123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
