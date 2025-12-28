import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingNav from './LandingNav';
import HomePage from './HomePage';
import FeaturesPage from './FeaturesPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import PricingPage from './PricingPage';
import BlogsPage from './BlogsPage';
import BlogDetailPage from './BlogDetailPage';
import SuccessStoriesPage from './SuccessStoriesPage';
import SuccessStoryDetailPage from './SuccessStoryDetailPage';
import CareersPage from './CareersPage';
import CareerDetailPage from './CareerDetailPage';
import PhilanthropyPage from './PhilanthropyPage';
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
                <Route path="pricing" element={<PricingPage />} />
                <Route path="blogs" element={<BlogsPage />} />
                <Route path="blogs/:slug" element={<BlogDetailPage />} />
                <Route path="success-stories" element={<SuccessStoriesPage />} />
                <Route path="success-stories/:slug" element={<SuccessStoryDetailPage />} />
                <Route path="careers" element={<CareersPage />} />
                <Route path="careers/:slug" element={<CareerDetailPage />} />
                <Route path="philanthropy" element={<PhilanthropyPage />} />
            </Routes>
        </div>
    );
};

export default LandingLayout;
