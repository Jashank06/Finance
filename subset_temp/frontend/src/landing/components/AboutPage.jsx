import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useInView, useMotionValue } from 'framer-motion';
import { FiShield, FiTarget, FiHeart, FiZap, FiUsers, FiGlobe } from 'react-icons/fi';
import AboutHeroVideo from '../../assets/About_hero.mp4';
import StoryVideo from '../../assets/story-video.mp4';
import MissionVideo from '../../assets/mission-video.mp4';
import StoryImage from '../../assets/Family_Finance_Hub.jpg';
import './AboutPage.css';

const AboutPage = () => {
    // Animation Variants
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

    const values = [
        {
            icon: <FiShield />,
            title: "Uncompromising Security",
            description: "We protect your data with bank-level encryption and privacy-first architecture."
        },
        {
            icon: <FiTarget />,
            title: "Crystal Clear Clarity",
            description: "Turning complex financial data into simple, actionable insights for your family."
        },
        {
            icon: <FiHeart />,
            title: "Family First",
            description: "Designed for real families, with features that bring everyone onto the same page."
        },
        {
            icon: <FiZap />,
            title: "Innovation Driven",
            description: "Constantly evolving with AI and smart operational tools to save you time."
        },
        {
            icon: <FiUsers />,
            title: "Radical Transparency",
            description: "No hidden fees, no data selling. Just a pure, honest financial tool."
        },
        {
            icon: <FiGlobe />,
            title: "Holistic View",
            description: "From daily expenses to long-term investments, see it all in one place."
        }
    ];


    // Counter Component for Stats
    const Counter = ({ value, prefix = "", suffix = "", decimals = 0 }) => {
        const ref = useRef(null);
        const inView = useInView(ref, { once: true, margin: "-100px" });
        const motionValue = useMotionValue(0);
        const springValue = useSpring(motionValue, {
            damping: 30,
            stiffness: 100,
            duration: 2
        });

        useEffect(() => {
            if (inView) {
                motionValue.set(value);
            }
        }, [inView, value, motionValue]);

        const [displayValue, setDisplayValue] = React.useState(0);

        useEffect(() => {
            const unsubscribe = springValue.on("change", (latest) => {
                if (decimals > 0) {
                    setDisplayValue(latest.toFixed(decimals));
                } else {
                    setDisplayValue(Math.round(latest));
                }
            });
            return unsubscribe;
        }, [springValue, decimals]);

        return (
            <span ref={ref}>
                {prefix}{displayValue}{suffix}
            </span>
        );
    };

    return (
        <div className="about-page">
            {/* HER0 SECTION */}
            <section className="about-hero">
                <div className="hero-video-container">
                    <video autoPlay loop muted playsInline className="hero-video-background">
                        <source src={AboutHeroVideo} type="video/mp4" />
                    </video>
                    <div className="hero-video-overlay"></div>
                </div>

                <motion.div
                    className="about-hero-content"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.span variants={fadeInUp} className="about-hero-label">OUR MISSION</motion.span>
                    <motion.h1 variants={fadeInUp} className="about-hero-title">
                        Empowering Families to<br />Master Their Wealth.
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="about-hero-description">
                        Financial freedom isn't just about money—it's about peace of mind. We're building the operating system for modern family finance.
                    </motion.p>
                </motion.div>
            </section>

            {/* STORY SECTION */}
            <section className="about-story">
                <div className="container">
                    <div className="story-grid">
                        <motion.div
                            className="story-content"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="section-label" style={{ color: '#0A0A0A', background: 'rgba(0,0,0,0.05)' }}>OUR STORY</span>
                            <h2>Born from Frustration.<br />Built for Clarity.</h2>
                            <p>
                                Managing a family's finances used to mean juggling spreadsheets, banking apps, investment portals, and messy file folders. We knew there had to be a better way.
                            </p>
                            <p>
                                We created this platform to bridge the gap between complex financial tools and the daily reality of family life. It's not just a tracker; it's a command center for your financial future.
                            </p>
                            <p>
                                Today, thousands of families trust us to track their net worth, plan their goals, and sleep better at night knowing exactly where they stand.
                            </p>
                        </motion.div>
                        <motion.div
                            className="story-visual"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="story-image-container">
                                <video autoPlay loop muted playsInline className="story-image">
                                    <source src={MissionVideo} type="video/mp4" />
                                </video>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* JOURNEY TIMELINE SECTION */}
            <section className="about-journey">
                {/* Background Video */}
                <div className="journey-video-container">
                    <video autoPlay loop muted playsInline className="journey-video-background">
                        <source src={StoryVideo} type="video/mp4" />
                    </video>
                    <div className="journey-video-overlay"></div>
                </div>

                <div className="container">
                    <motion.div
                        className="journey-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="journey-label">OUR JOURNEY</span>
                        <h2 className="journey-title">From idea to impact</h2>
                    </motion.div>

                    <div className="timeline-wrapper">
                        <div className="timeline-line"></div>

                        <motion.div
                            className="timeline-item"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <span className="timeline-year">2019</span>
                                <h3>The Beginning</h3>
                                <p>Founded by two parents who struggled to manage family finances without friction.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="timeline-item"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <span className="timeline-year">2020</span>
                                <h3>First Launch</h3>
                                <p>Released our beta to 500 families, learning and iterating based on real feedback.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="timeline-item"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <span className="timeline-year">2022</span>
                                <h3>Major Milestone</h3>
                                <p>Crossed 100,000 families and secured Series A funding to expand our vision.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="timeline-item"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <span className="timeline-year">2024</span>
                                <h3>Today</h3>
                                <p>Serving over 250,000 families with a complete financial wellness platform.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="about-stats">
                <div className="container">
                    <div className="stats-container">
                        <motion.div
                            className="stat-item-large"
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="stat-number-large">
                                <Counter value={5} suffix="+" />
                            </div>
                            <div className="stat-label-large">Years of Trust</div>
                        </motion.div>
                        <motion.div
                            className="stat-item-large"
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="stat-number-large">
                                <Counter value={1} prefix="$" suffix="B+" />
                            </div>
                            <div className="stat-label-large">Assets Tracked</div>
                        </motion.div>
                        <motion.div
                            className="stat-item-large"
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="stat-number-large">
                                <Counter value={50} suffix="K+" />
                            </div>
                            <div className="stat-label-large">Active Users</div>
                        </motion.div>
                        <motion.div
                            className="stat-item-large"
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="stat-number-large">
                                <Counter value={4.9} decimals={1} />
                            </div>
                            <div className="stat-label-large">App Rating</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* VALUES SECTION */}
            <section className="about-values">
                <div className="container">
                    <motion.div
                        className="values-title-wrapper"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="values-title">Driven by Core Values</h2>
                        <p style={{ color: '#888', maxWidth: '600px', margin: '0 auto' }}>
                            These principles guide every feature we build and every decision we make.
                        </p>
                    </motion.div>

                    <div className="values-grid">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                className="value-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                                <div className="value-icon-box">
                                    {value.icon}
                                </div>
                                <h3 className="value-title">{value.title}</h3>
                                <p className="value-description">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <motion.div
                    className="container"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="cta-box">
                        <h2 className="cta-heading">Ready to Join the Movement?</h2>
                        <p className="cta-subtext">
                            Take control of your family's financial future today. No credit card required.
                        </p>
                        <a href="#signup" className="cta-btn-primary">
                            Start Your Journey
                        </a>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default AboutPage;
