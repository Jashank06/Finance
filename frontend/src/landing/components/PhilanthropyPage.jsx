import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiHeart, FiActivity, FiAward, FiCalendar,
    FiImage, FiArrowRight, FiUsers, FiStar,
    FiShield, FiTrendingUp, FiCrosshair, FiBookOpen,
    FiSunrise, FiDroplet
} from 'react-icons/fi';
import './PhilanthropyPage.css';
import heroVideo from '../../assets/hero-bg-new.mp4';

const PhilanthropyPage = () => {
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const services = [
        { icon: <FiActivity />, title: 'Health Care', desc: 'Providing essential healthcare services and medical support to underserved communities.', color: '#EF4444', link: 'https://venshitafoundation.org/healthcare' },
        { icon: <FiUsers />, title: 'Social Welfare', desc: 'Empowering communities through social programs and welfare initiatives.', color: '#3B82F6', link: 'https://venshitafoundation.org/socialwelfare' },
        { icon: <FiSunrise />, title: 'Religious', desc: 'Supporting religious and spiritual activities that strengthen community bonds.', color: '#F59E0B', link: 'https://venshitafoundation.org/religious' },
        { icon: <FiBookOpen />, title: 'Education', desc: 'Promoting quality education and learning opportunities for a brighter future.', color: '#8B5CF6', link: 'https://venshitafoundation.org/education' },
        { icon: <FiCrosshair />, title: 'Environment', desc: 'Protecting and preserving our environment for future generations.', color: '#10B981', link: 'https://venshitafoundation.org/environment' },
        { icon: <FiDroplet />, title: 'Nirmalya Visarjan', desc: 'Eco-friendly immersion services maintaining the purity of our water bodies.', color: '#06B6D4', link: 'https://venshitafoundation.org/nirmalyavisarjan' }
    ];

    const handleRedirect = (url) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="philanthropy-page">
            {/* HERO SECTION */}
            <section className="philo-hero">
                <div className="philo-hero-video-container">
                    <video
                        className="philo-hero-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        <source src={heroVideo} type="video/mp4" />
                    </video>
                    <div className="philo-hero-overlay"></div>
                </div>

                <div className="philo-hero-content animate-on-scroll">
                    <div className="philo-badge">
                        <FiHeart className="badge-icon" />
                        <span>Giving Back to Community</span>
                    </div>
                    <h1 className="philo-title">Philanthropy</h1>
                    <p className="philo-subtitle">
                        Building communities, sharing knowledge, and celebrating success stories together
                    </p>
                </div>
            </section>

            {/* GET INVOLVED SECTION */}
            <section className="section philo-involved">
                <div className="container">
                    <div className="philo-grid">
                        <div className="philo-card volunteer animate-on-scroll" onClick={() => handleRedirect('https://venshitafoundation.org/registration')}>
                            <div className="philo-card-icon-wrapper">
                                <FiUsers className="philo-card-icon" />
                            </div>
                            <h3>Volunteer</h3>
                            <p>Join our team of dedicated volunteers and make a difference in your community through construction and development projects.</p>
                            <button className="philo-link">Learn More <FiArrowRight /></button>
                            <div className="card-bg-circle"></div>
                        </div>

                        <div className="philo-card donate animate-on-scroll delay-1" onClick={() => handleRedirect('https://venshitafoundation.org/donate')}>
                            <div className="philo-card-icon-wrapper">
                                <FiHeart className="philo-card-icon" />
                            </div>
                            <h3>Donate</h3>
                            <p>Support our mission with your generous donations. Every contribution helps us build better communities.</p>
                            <button className="philo-link">Donate Now <FiArrowRight /></button>
                            <div className="card-bg-circle"></div>
                        </div>

                        <div className="philo-card sponsor animate-on-scroll delay-2" onClick={() => handleRedirect('https://venshitafoundation.org/sponsorship')}>
                            <div className="philo-card-icon-wrapper">
                                <FiAward className="philo-card-icon" />
                            </div>
                            <h3>Sponsor</h3>
                            <p>Become a sponsor and gain visibility while supporting meaningful construction initiatives and community projects.</p>
                            <button className="philo-link">Become a Sponsor <FiArrowRight /></button>
                            <div className="card-bg-circle"></div>
                        </div>

                        <div className="philo-card events animate-on-scroll delay-3" onClick={() => handleRedirect('https://venshitafoundation.org/participation')}>
                            <div className="philo-card-icon-wrapper">
                                <FiCalendar className="philo-card-icon" />
                            </div>
                            <h3>Upcoming Events</h3>
                            <p>Stay informed about our upcoming events, workshops, and community gatherings focused on sustainable construction.</p>
                            <button className="philo-link">View Events <FiArrowRight /></button>
                            <div className="card-bg-circle"></div>
                        </div>
                    </div>

                    <div className="philo-grid-secondary">
                        <div className="philo-card activities animate-on-scroll" onClick={() => handleRedirect('https://venshitafoundation.org/upcoming')}>
                            <div className="philo-card-icon-wrapper">
                                <FiStar className="philo-card-icon" />
                            </div>
                            <h3>Upcoming Activities</h3>
                            <p>Discover our planned activities, training programs, and collaborative projects designed to empower communities.</p>
                            <button className="philo-link">Explore Activities <FiArrowRight /></button>
                            <div className="card-bg-circle"></div>
                        </div>

                        <div className="philo-card gallery animate-on-scroll delay-1" onClick={() => handleRedirect('https://venshitafoundation.org/gallary')}>
                            <div className="philo-card-icon-wrapper">
                                <FiImage className="philo-card-icon" />
                            </div>
                            <h3>Gallery</h3>
                            <p>Explore our collection of photos and moments from our community events, projects, and philanthropic activities.</p>
                            <button className="philo-link">View Gallery <FiArrowRight /></button>
                            <div className="card-bg-circle"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* OUR SERVICES SECTION */}
            <section className="section philo-services">
                <div className="container">
                    <div className="text-center mb-60">
                        <h2 className="section-title">Our Services</h2>
                        <p className="section-description">Making a difference through diverse community service initiatives</p>
                    </div>

                    <div className="services-grid">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className={`service-card animate-on-scroll delay-${(index % 3) + 1}`}
                                onClick={() => handleRedirect(service.link)}
                            >
                                <div className="service-icon-wrapper" style={{ backgroundColor: service.color }}>
                                    {service.icon}
                                </div>
                                <h3>{service.title}</h3>
                                <p>{service.desc}</p>
                                <button className="service-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    handleRedirect(service.link);
                                }}>Learn More <FiArrowRight /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PhilanthropyPage;
