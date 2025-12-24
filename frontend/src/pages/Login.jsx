import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiTrendingUp, FiShield, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import financeLogo from '../assets/FinanceLogo.png';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ email, password });

    if (result.success) {
      // Redirect based on user role
      if (result.user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
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
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Log in to continue managing your finances.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
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
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

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
