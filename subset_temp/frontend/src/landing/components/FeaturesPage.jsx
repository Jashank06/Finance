import React, { useEffect } from 'react';
import {
    FiUsers, FiTrendingUp, FiDollarSign, FiBarChart2, FiCalendar,
    FiBell, FiShield, FiClock, FiTarget, FiHome, FiBriefcase,
    FiCreditCard, FiPieChart, FiFileText, FiUploadCloud, FiDownloadCloud,
    FiMail, FiPhone, FiLock, FiCheck
} from 'react-icons/fi';
import FeaturesHeroVideo from '../../assets/FeaturesHeroSection.mp4';
import './FeaturesPage.css';
import { motion } from 'framer-motion';

// Import Feature Images
import FamilyHubImg from '../../assets/Family_Finance_Hub.jpg';
import SmartTrackingImg from '../../assets/Smart_transcation_Tracking.png';
import InvestmentImg from '../../assets/Investment_Intelligence.jpg';
import RemindersImg from '../../assets/Reminders.png';
import MultiCalendarImg from '../../assets/Multi_Calendar_System.jpg';
import AnalyticsImg from '../../assets/Analytics.webp';
import BudgetMgmtImg from '../../assets/Budget_Management_Create.jpg';
import GoalTrackingImg from '../../assets/Goal_Tracking.jpg';
import ExpenseMgmtImg from '../../assets/ExpenseManagement.jpg';
import IncomeTrackingImg from '../../assets/IncomeTracking.webp';
import BillMgmtImg from '../../assets/Bill_Management.jpg';
import DocStorageImg from '../../assets/Document_Storage.jpg';
import DataExportImg from '../../assets/Data_Export.jpg';
import SecurityImg from '../../assets/Bank_Level_Security.jpeg';
import PropertyMgmtImg from '../../assets/Property_Management.jpg';
import BusinessFinanceImg from '../../assets/Business_FInance.avif';
import TimeReportsImg from '../../assets/Time_Based_Reports.jpg';
import PrivacyImg from '../../assets/Privacy_control.jpg';

const FeaturesPage = () => {
    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const features = [
        {
            id: 1,
            title: "Family Finance Hub",
            description: "Complete family financial management in one unified dashboard. Track every member's income, expenses, and savings.",
            icon: <FiUsers />,
            image: FamilyHubImg,
            benefits: [
                "Multi-member profiles",
                "Individual privacy controls",
                "Unified family view",
                "Role-based permissions"
            ],
            stats: { value: "100%", label: "Family Coverage" }
        },
        {
            id: 2,
            title: "Smart Transaction Tracking",
            description: "Auto-categorize every cash, card, and bank transaction with intelligent AI-powered categorization.",
            icon: <FiCreditCard />,
            image: SmartTrackingImg,
            benefits: [
                "Auto-categorization",
                "Receipt scanning",
                "Duplicate detection",
                "Multi-currency support"
            ],
            stats: { value: "99%", label: "Accuracy" }
        },
        {
            id: 3,
            title: "Investment Intelligence",
            description: "Real-time portfolio tracking across all asset classes including stocks, mutual funds, and fixed deposits.",
            icon: <FiTrendingUp />,
            image: InvestmentImg,
            benefits: [
                "Real-time tracking",
                "Portfolio analytics",
                "Performance insights",
                "Asset allocation"
            ],
            stats: { value: "24/7", label: "Live Updates" }
        },
        {
            id: 4,
            title: "Intelligent Reminders",
            description: "Never miss a bill, milestone, or payment deadline with smart notifications and alerts.",
            icon: <FiBell />,
            image: RemindersImg,
            benefits: [
                "Bill reminders",
                "Payment alerts",
                "Milestone tracking",
                "Custom notifications"
            ],
            stats: { value: "0", label: "Missed Bills" }
        },
        {
            id: 5,
            title: "Multi-Calendar System",
            description: "Separate calendars for bills, events, and goals with synchronized reminders.",
            icon: <FiCalendar />,
            image: MultiCalendarImg,
            benefits: [
                "Bill calendar",
                "Event calendar",
                "Goal milestones",
                "Recurring entries"
            ],
            stats: { value: "3", label: "Calendars" }
        },
        {
            id: 6,
            title: "Advanced Analytics",
            description: "Comprehensive financial analytics with visual charts, trends, and insights.",
            icon: <FiBarChart2 />,
            image: AnalyticsImg,
            benefits: [
                "Spending trends",
                "Income analysis",
                "Budget tracking",
                "Custom reports"
            ],
            stats: { value: "50+", label: "Data Points" }
        },
        {
            id: 7,
            title: "Budget Management",
            description: "Create and track budgets for different categories with real-time spending alerts.",
            icon: <FiDollarSign />,
            image: BudgetMgmtImg,
            benefits: [
                "Category budgets",
                "Spending alerts",
                "Budget forecasting",
                "Overspend warnings"
            ],
            stats: { value: "₹50K+", label: "Avg Savings" }
        },
        {
            id: 8,
            title: "Goal Tracking",
            description: "Set and track financial goals with progress monitoring and achievement milestones.",
            icon: <FiTarget />,
            image: GoalTrackingImg,
            benefits: [
                "Multiple goals",
                "Progress tracking",
                "Auto-savings",
                "Achievement badges"
            ],
            stats: { value: "73%", label: "Success Rate" }
        },
        {
            id: 9,
            title: "Expense Management",
            description: "Categorize and track all expenses with detailed breakdowns and analysis.",
            icon: <FiPieChart />,
            image: ExpenseMgmtImg,
            benefits: [
                "Auto-categorization",
                "Expense splitting",
                "Receipt storage",
                "Tax categorization"
            ],
            stats: { value: "15+", label: "Categories" }
        },
        {
            id: 10,
            title: "Income Tracking",
            description: "Track all income sources including salary, business, and passive income.",
            icon: <FiTrendingUp />,
            image: IncomeTrackingImg,
            benefits: [
                "Multiple sources",
                "Recurring income",
                "Income forecasting",
                "Tax calculations"
            ],
            stats: { value: "100%", label: "Tracked" }
        },
        {
            id: 11,
            title: "Bill Management",
            description: "Manage all recurring bills with automatic reminders and payment tracking.",
            icon: <FiFileText />,
            image: BillMgmtImg,
            benefits: [
                "Bill reminders",
                "Payment history",
                "Auto-recurring",
                "Vendor management"
            ],
            stats: { value: "99.9%", label: "On-Time" }
        },
        {
            id: 12,
            title: "Document Storage",
            description: "Secure cloud storage for all financial documents, receipts, and important files.",
            icon: <FiUploadCloud />,
            image: DocStorageImg,
            benefits: [
                "Unlimited storage",
                "OCR scanning",
                "Smart organization",
                "Quick search"
            ],
            stats: { value: "256-bit", label: "Encryption" }
        },
        {
            id: 13,
            title: "Data Export",
            description: "Export all your financial data in multiple formats for analysis and backup.",
            icon: <FiDownloadCloud />,
            image: DataExportImg,
            benefits: [
                "Excel export",
                "PDF reports",
                "CSV format",
                "Scheduled exports"
            ],
            stats: { value: "5+", label: "Formats" }
        },
        {
            id: 14,
            title: "Bank-Level Security",
            description: "Military-grade encryption and security measures to protect your financial data.",
            icon: <FiShield />,
            image: SecurityImg,
            benefits: [
                "256-bit encryption",
                "Two-factor auth",
                "Secure backups",
                "Privacy controls"
            ],
            stats: { value: "99.9%", label: "Uptime" }
        },
        {
            id: 15,
            title: "Property Management",
            description: "Track property details, EMIs, and related expenses for all your real estate.",
            icon: <FiHome />,
            image: PropertyMgmtImg,
            benefits: [
                "Property tracking",
                "EMI management",
                "Maintenance logs",
                "Value tracking"
            ],
            stats: { value: "Unlimited", label: "Properties" }
        },
        {
            id: 16,
            title: "Business Finance",
            description: "Separate business finance tracking with invoicing and expense management.",
            icon: <FiBriefcase />,
            image: BusinessFinanceImg,
            benefits: [
                "Business accounts",
                "Invoice tracking",
                "Expense reports",
                "Tax planning"
            ],
            stats: { value: "Pro", label: "Features" }
        },
        {
            id: 17,
            title: "Time-Based Reports",
            description: "Generate detailed financial reports for any time period with one click.",
            icon: <FiClock />,
            image: TimeReportsImg,
            benefits: [
                "Custom periods",
                "Comparison reports",
                "Trend analysis",
                "Export options"
            ],
            stats: { value: "Instant", label: "Generation" }
        },
        {
            id: 18,
            title: "Privacy Controls",
            description: "Granular privacy settings to control what family members can see and access.",
            icon: <FiLock />,
            image: PrivacyImg,
            benefits: [
                "Member permissions",
                "Data visibility",
                "Sharing controls",
                "Audit logs"
            ],
            stats: { value: "100%", label: "Control" }
        }
    ];

    return (
        <div className="features-page">
            {/* Hero Section */}
            <section className="features-hero">
                <div className="hero-video-container">
                    <video autoPlay loop muted playsInline className="hero-video-background">
                        <source src={FeaturesHeroVideo} type="video/mp4" />
                    </video>
                    <div className="hero-video-overlay"></div>
                </div>

                <motion.div
                    className="features-hero-content"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.span variants={fadeInUp} className="features-hero-label">COMPREHENSIVE FEATURES</motion.span>
                    <motion.h1 variants={fadeInUp} className="features-hero-title">
                        Everything You Need to<br />
                        Master Your Finances
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="features-hero-description">
                        Powerful tools and features designed to give you complete control over your family's financial life.
                        From tracking to planning, we've got you covered.
                    </motion.p>
                    <motion.div variants={fadeInUp} className="features-hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-number">150+</div>
                            <div className="hero-stat-label">Features</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-number">50K+</div>
                            <div className="hero-stat-label">Active Users</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-number">99.9%</div>
                            <div className="hero-stat-label">Uptime</div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="features-showcase">
                <div className="container">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.id}
                            className={`feature-showcase-item ${index % 2 === 0 ? 'image-left' : 'image-right'}`}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="feature-showcase-content">
                                <div className="feature-number">
                                    {feature.id < 10 ? `0${feature.id}` : feature.id}
                                </div>
                                <div className="feature-icon-wrapper">
                                    <div className="feature-icon-bg">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="feature-showcase-title">{feature.title}</h3>
                                <p className="feature-showcase-description">{feature.description}</p>

                                <div className="feature-benefits">
                                    {feature.benefits.map((benefit, idx) => (
                                        <div key={idx} className="feature-benefit">
                                            <FiCheck className="benefit-check" />
                                            <span>{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="feature-stat-badge">
                                    <div className="stat-value">{feature.stats.value}</div>
                                    <div className="stat-label">{feature.stats.label}</div>
                                </div>
                            </div>

                            <div className="feature-showcase-visual">
                                <motion.div
                                    className="feature-visual-card"
                                    whileHover={{ y: -10, boxShadow: "0 30px 80px rgba(0, 0, 0, 0.12)" }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="feature-image"
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="features-cta">
                <motion.div
                    className="container"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="cta-title">Ready to Transform Your Financial Life?</h2>
                    <p className="cta-description">
                        Join thousands of families who have already taken control of their finances
                    </p>
                    <motion.a
                        href="#pricing"
                        className="cta-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Start Free Trial
                    </motion.a>
                </motion.div>
            </section>
        </div>
    );
};

export default FeaturesPage;
