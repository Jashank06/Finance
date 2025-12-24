import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingNav from './LandingNav';
import HomePage from './HomePage';
import FeaturesPage from './FeaturesPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import '../styles/Landing.css';

const LandingLayout = () => {
    return (
        <div className="landing-layout">
            <LandingNav />
            <Routes>
                <Route index element={<HomePage />} />
                <Route path="features" element={<FeaturesPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
            </Routes>
        </div>
    );
};

export default LandingLayout;
