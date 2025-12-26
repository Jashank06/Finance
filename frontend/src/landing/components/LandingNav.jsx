import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiChevronRight } from 'react-icons/fi';
import financeLogo from '../../assets/FinanceLogo.png';
import './LandingNav.css';

const LandingNav = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [animated, setAnimated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Trigger animation on mount
        setTimeout(() => setAnimated(true), 100);
    }, []);

    const isActive = (path) => location.pathname === path;

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleNavigation = () => {
        scrollToTop();
        setMobileMenuOpen(false);
    };

    return (
        <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                {/* Logo */}
                <div className="nav-logo">
                    <Link to="/landing" className="logo-link">
                        <div className={`logo-icon ${animated ? 'animated' : ''}`}>
                            <img src={financeLogo} alt="Finance Master Logo" className="logo-image" />
                        </div>
                        <span className={`logo-text ${animated ? 'animated' : ''}`}>
                            Finance<span className="logo-accent">Master</span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation Links */}
                <div className="nav-links">
                    <Link
                        to="/landing"
                        className={`nav-link ${isActive('/landing') ? 'active' : ''}`}
                        onClick={scrollToTop}
                    >
                        <span>Home</span>
                    </Link>
                    <Link
                        to="/landing/features"
                        className={`nav-link ${isActive('/landing/features') ? 'active' : ''}`}
                        onClick={scrollToTop}
                    >
                        <span>Features</span>
                    </Link>
                    <Link
                        to="/landing/about"
                        className={`nav-link ${isActive('/landing/about') ? 'active' : ''}`}
                        onClick={scrollToTop}
                    >
                        <span>About</span>
                    </Link>
                    <Link
                        to="/landing/blogs"
                        className={`nav-link ${isActive('/landing/blogs') ? 'active' : ''}`}
                        onClick={scrollToTop}
                    >
                        <span>Blogs</span>
                    </Link>
                    <Link
                        to="/landing/success-stories"
                        className={`nav-link ${isActive('/landing/success-stories') ? 'active' : ''}`}
                        onClick={scrollToTop}
                    >
                        <span>Success Stories</span>
                    </Link>
                    <Link
                        to="/landing/careers"
                        className={`nav-link ${isActive('/landing/careers') ? 'active' : ''}`}
                        onClick={scrollToTop}
                    >
                        <span>Careers</span>
                    </Link>
                    <Link
                        to="/landing/contact"
                        className={`nav-link ${isActive('/landing/contact') ? 'active' : ''}`}
                        onClick={scrollToTop}
                    >
                        <span>Contact</span>
                    </Link>
                </div>

                {/* Action Buttons */}
                <div className="nav-actions">
                    <Link to="/login" className="nav-link-login" onClick={scrollToTop}>
                        Login
                    </Link>
                    <Link to="/signup" className="btn-nav-signup" onClick={scrollToTop}>
                        <span>Get Started</span>
                        <FiChevronRight className="btn-icon" />
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-links">
                    <Link
                        to="/landing"
                        className={`mobile-nav-link ${isActive('/landing') ? 'active' : ''}`}
                        onClick={handleNavigation}
                    >
                        Home
                    </Link>
                    <Link
                        to="/landing/features"
                        className={`mobile-nav-link ${isActive('/landing/features') ? 'active' : ''}`}
                        onClick={handleNavigation}
                    >
                        Features
                    </Link>
                    <Link
                        to="/landing/about"
                        className={`mobile-nav-link ${isActive('/landing/about') ? 'active' : ''}`}
                        onClick={handleNavigation}
                    >
                        About
                    </Link>
                    <Link
                        to="/landing/blogs"
                        className={`mobile-nav-link ${isActive('/landing/blogs') ? 'active' : ''}`}
                        onClick={handleNavigation}
                    >
                        Blogs
                    </Link>
                    <Link
                        to="/landing/success-stories"
                        className={`mobile-nav-link ${isActive('/landing/success-stories') ? 'active' : ''}`}
                        onClick={handleNavigation}
                    >
                        Success Stories
                    </Link>
                    <Link
                        to="/landing/careers"
                        className={`mobile-nav-link ${isActive('/landing/careers') ? 'active' : ''}`}
                        onClick={handleNavigation}
                    >
                        Careers
                    </Link>
                    <Link
                        to="/landing/contact"
                        className={`mobile-nav-link ${isActive('/landing/contact') ? 'active' : ''}`}
                        onClick={handleNavigation}
                    >
                        Contact
                    </Link>
                    <div className="mobile-menu-actions">
                        <Link
                            to="/login"
                            className="mobile-login-btn"
                            onClick={handleNavigation}
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="mobile-signup-btn"
                            onClick={handleNavigation}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default LandingNav;
