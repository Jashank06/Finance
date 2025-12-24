import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiTrendingUp, FiShield, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import financeLogo from '../assets/FinanceLogo.png';
import './Login.css'; // Reusing Login styles for consistent theme

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await register({ name, email, password });

        if (result.success) {
            navigate('/dashboard');
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
                        Begin Your Journey<br />
                        to Financial Freedom.
                    </h1>

                    <p className="branding-subtitle">
                        Create an account to track your wealth, manage expenses, and plan your family's future securely.
                    </p>

                    <div className="branding-features">
                        <div className="branding-feature">
                            <div className="feature-icon-circle">
                                <FiUsers />
                            </div>
                            <span>Join a community of smart savers</span>
                        </div>

                        <div className="branding-feature">
                            <div className="feature-icon-circle">
                                <FiTrendingUp />
                            </div>
                            <span>Visual analytics for your portfolio</span>
                        </div>

                        <div className="branding-feature">
                            <div className="feature-icon-circle">
                                <FiShield />
                            </div>
                            <span>Your data is encrypted and secure</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="auth-form-section">
                <div className="auth-form-container">
                    <div className="auth-header">
                        <h2 className="auth-title">Create an account</h2>
                        <p className="auth-subtitle">Start managing your finances today.</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Enter your full name"
                                className="form-input"
                            />
                        </div>

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
                                    placeholder="Create a password"
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

                        <button type="submit" disabled={loading} className="auth-button">
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="auth-switch">
                        <span>Already have an account?</span>
                        <Link to="/login" className="auth-switch-link">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
