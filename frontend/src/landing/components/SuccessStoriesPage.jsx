import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiStar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import './SuccessStoriesPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const SuccessStoriesPage = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = ['Investment Success', 'Debt Free', 'Financial Goal Achieved', 'Business Growth', 'Retirement Planning', 'Other'];

    useEffect(() => {
        fetchStories();
    }, [selectedCategory]);

    const fetchStories = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('category', selectedCategory);
            params.append('limit', '20');

            const response = await axios.get(`${API_URL}/success-stories/public?${params}`);
            setStories(response.data.stories);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stories:', error);
            setLoading(false);
        }
    };

    const handleStoryClick = (slug) => {
        window.location.href = `/landing/success-stories/${slug}`;
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FiStar
                key={i}
                size={16}
                fill={i < rating ? '#f59e0b' : 'transparent'}
                color={i < rating ? '#f59e0b' : '#d1d5db'}
            />
        ));
    };

    return (
        <div className="success-stories-page">
            {/* Hero Section */}
            <div className="success-hero">
                <h1 className="success-hero-title">Success Stories</h1>
                <p className="success-hero-subtitle">
                    Real stories from real people who achieved their financial goals with FinanceMaster
                </p>
            </div>

            {/* Filter Section */}
            <div className="success-filter-section">
                <div className="success-filter-card">
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#FFFFFF', fontSize: '14px', letterSpacing: '1px' }}>
                        Filter by Category
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                        style={{ maxWidth: '400px' }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stories Grid */}
            <div className="success-container">
                {loading ? (
                    <div className="blogs-loading">
                        <p>Loading success stories...</p>
                    </div>
                ) : stories.length === 0 ? (
                    <div className="blogs-empty">
                        <p>No success stories found.</p>
                    </div>
                ) : (
                    <div className="success-grid">
                        {stories.map(story => (
                            <div
                                key={story._id}
                                className="success-card"
                                onClick={() => handleStoryClick(story.slug)}
                            >
                                {story.featured && (
                                    <div className="featured-badge">
                                        <FiStar size={12} fill="white" />
                                        Featured
                                    </div>
                                )}
                                {story.featuredImage && (
                                    <img
                                        src={story.featuredImage}
                                        alt={story.title}
                                        className="success-featured-image"
                                    />
                                )}
                                <div className="success-content">
                                    {/* Customer Info */}
                                    <div className="customer-info">
                                        {story.customerImage ? (
                                            <img
                                                src={story.customerImage}
                                                alt={story.customerName}
                                                className="customer-avatar"
                                            />
                                        ) : (
                                            <div className="customer-avatar-placeholder">
                                                {story.customerName.charAt(0)}
                                            </div>
                                        )}
                                        <div className="customer-details">
                                            <h4>{story.customerName}</h4>
                                            {story.customerRole && (
                                                <p className="customer-role">{story.customerRole}</p>
                                            )}
                                            {story.customerLocation && (
                                                <div className="customer-location">
                                                    <FiMapPin size={12} />
                                                    {story.customerLocation}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <span className="story-category">{story.category}</span>
                                    <h3 className="story-title">{story.title}</h3>
                                    <p className="story-excerpt">{story.excerpt}</p>

                                    <div className="story-meta">
                                        <div className="star-rating">
                                            {renderStars(story.rating)}
                                        </div>
                                        <FiArrowRight color="rgba(16, 185, 129, 0.8)" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuccessStoriesPage;
