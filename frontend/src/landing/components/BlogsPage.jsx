import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiUser, FiTag, FiArrowRight } from 'react-icons/fi';
import './BlogsPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const BlogsPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['Finance Tips', 'Investment', 'Tax Planning', 'Personal Finance', 'Technology', 'News', 'Other'];

    useEffect(() => {
        fetchBlogs();
    }, [selectedCategory, searchQuery]);

    const fetchBlogs = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('category', selectedCategory);
            if (searchQuery) params.append('search', searchQuery);
            params.append('limit', '20');

            const response = await axios.get(`${API_URL}/blogs/public?${params}`);
            setBlogs(response.data.blogs);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleBlogClick = (slug) => {
        window.location.href = `/landing/blogs/${slug}`;
    };

    return (
        <div className="blogs-page">
            {/* Hero Section */}
            <div className="blogs-hero">
                <h1 className="blogs-hero-title">Our Blog</h1>
                <p className="blogs-hero-subtitle">
                    Stay updated with the latest insights on finance, investment, and personal wealth management
                </p>
            </div>

            {/* Filter Section */}
            <div className="blogs-filter-section">
                <div className="blogs-filter-card">
                    <div className="blogs-filter-grid">
                        <div className="filter-group">
                            <label>Search Blogs</label>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Search by title or content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Filter by Category</label>
                            <select
                                className="filter-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blog Grid */}
            <div className="blogs-container">
                {loading ? (
                    <div className="blogs-loading">
                        <p>Loading blogs...</p>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="blogs-empty">
                        <p>No blogs found. Try a different search or category.</p>
                    </div>
                ) : (
                    <div className="blogs-grid">
                        {blogs.map(blog => (
                            <div
                                key={blog._id}
                                className="blog-card"
                                onClick={() => handleBlogClick(blog.slug)}
                            >
                                {blog.featuredImage && (
                                    <img
                                        src={blog.featuredImage}
                                        alt={blog.title}
                                        className="blog-featured-image"
                                    />
                                )}
                                <div className="blog-content">
                                    <span className="blog-category">{blog.category}</span>
                                    <h3 className="blog-title">{blog.title}</h3>
                                    <p className="blog-excerpt">{blog.excerpt}</p>
                                    <div className="blog-meta">
                                        <div className="blog-meta-info">
                                            <div className="blog-meta-item">
                                                <FiUser size={14} />
                                                <span>{blog.author}</span>
                                            </div>
                                            <div className="blog-meta-item">
                                                <FiCalendar size={14} />
                                                <span>{formatDate(blog.publishedDate)}</span>
                                            </div>
                                        </div>
                                        <FiArrowRight color="rgba(255,255,255,0.6)" />
                                    </div>
                                    {blog.tags && blog.tags.length > 0 && (
                                        <div className="blog-tags">
                                            {blog.tags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="blog-tag">
                                                    <FiTag size={10} />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogsPage;
