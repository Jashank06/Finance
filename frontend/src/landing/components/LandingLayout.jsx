import React from 'react';
import LandingNav from './LandingNav';
import HomePage from './HomePage';
import '../styles/Landing.css';

const LandingLayout = () => {
    return (
        <div className="landing-layout">
            <LandingNav />
            <HomePage />
        </div>
    );
};

export default LandingLayout;
