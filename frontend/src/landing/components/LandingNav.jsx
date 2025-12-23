import React from 'react';
import { Link } from 'react-router-dom';
import './LandingNav.css';

const LandingNav = () => {
    return (
        <nav className="landing-nav">
            <div className="nav-container">
                <div className="nav-logo">
                    <Link to="/landing">
                        <span className="logo-text">Finance<span className="logo-accent">Master</span></span>
                    </Link>
                </div>

                <div className="nav-links">
                    <Link to="/landing" className="nav-link">Home</Link>
                    <Link to="/landing/features" className="nav-link">Features</Link>
                    <Link to="/landing/about" className="nav-link">About</Link>
                    <Link to="/landing/contact" className="nav-link">Contact</Link>
                </div>

                <div className="nav-actions">
                    <Link to="/login" className="nav-link-login">Login</Link>
                    <Link to="/signup" className="btn-nav-signup">Sign Up</Link>
                </div>
            </div>
        </nav>
    );
};

export default LandingNav;
