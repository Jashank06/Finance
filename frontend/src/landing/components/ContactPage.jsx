import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiSend, FiArrowLeft } from 'react-icons/fi';
import financeLogo from '../../assets/FinanceLogo.png';
import './ContactPage.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log('Form submitted:', formData);
        alert('Message sent! We will get back to you shortly.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="contact-container">
            
            {/* Left Side - Contact Info */}
            <div className="contact-branding">
                <div className="branding-content">
                    <h1 className="branding-title">
                        Let's Start a<br />
                        Conversation.
                    </h1>

                    <p className="branding-subtitle">
                        Have questions about our platform? Need help with your account? We're here to help you every step of the way.
                    </p>

                    <div className="contact-info-list">
                        <div className="contact-info-item">
                            <div className="info-icon-circle">
                                <FiMail />
                            </div>
                            <div className="info-text">
                                <h4>Email Us</h4>
                                <p>support@financemaster.com</p>
                            </div>
                        </div>

                        <div className="contact-info-item">
                            <div className="info-icon-circle">
                                <FiPhone />
                            </div>
                            <div className="info-text">
                                <h4>Call Us</h4>
                                <p>+1 (555) 123-4567</p>
                            </div>
                        </div>

                        <div className="contact-info-item">
                            <div className="info-icon-circle">
                                <FiMapPin />
                            </div>
                            <div className="info-text">
                                <h4>Visit Us</h4>
                                <p>123 Finance Street, New York, NY 10001</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="contact-form-section">
                <div className="contact-form-container">
                    <div className="form-header">
                        <h2 className="form-title">Send us a message</h2>
                        <p className="form-subtitle">Fill out the form below and we'll get back to you within 24 hours.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your Name"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@example.com"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject" className="form-label">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                placeholder="How can we help?"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message" className="form-label">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                placeholder="Tell us more about your inquiry..."
                                className="form-textarea"
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-button">
                            <span>Send Message</span>
                            <FiSend />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
