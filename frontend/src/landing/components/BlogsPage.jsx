import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCalendar, FiUser, FiTag, FiArrowRight } from 'react-icons/fi';
import './BlogsPage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const BlogsPage = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);
    const [latestBlogs, setLatestBlogs] = useState([]);
    const [popularBlogs, setPopularBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['Finance Tips', 'Investment', 'Tax Planning', 'Personal Finance', 'Technology', 'News', 'Other'];

    useEffect(() => {
        fetchBlogs();
        fetchSidebarBlogs();
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

    const fetchSidebarBlogs = async () => {
        try {
            // Fetch all blogs for sidebar
            const allResponse = await axios.get(`${API_URL}/blogs/public?limit=100`);
            setAllBlogs(allResponse.data.blogs);

            // Fetch latest blogs (sorted by date)
            const latestResponse = await axios.get(`${API_URL}/blogs/public?limit=5&sort=date`);
            setLatestBlogs(latestResponse.data.blogs);

            // Fetch popular blogs (sorted by views)
            const popularResponse = await axios.get(`${API_URL}/blogs/public?limit=5&sort=views`);
            setPopularBlogs(popularResponse.data.blogs);
        } catch (error) {
            console.error('Error fetching sidebar blogs:', error);
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
        navigate(`/landing/blogs/${slug}`);
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
                    <div className="blogs-filter-single">
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
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="blogs-container">
                <div className="blogs-layout">
                    {/* Blog Grid */}
                    <div className="blogs-main-content">
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

                    {/* Sidebar */}
                    <aside className="blogs-sidebar">
                        {/* View All Blogs */}
                        <div className="sidebar-section">
                            <h3 className="sidebar-title">View All Blogs</h3>
                            <ul className="sidebar-list">
                                {allBlogs.slice(0, 10).map(blog => (
                                    <li 
                                        key={blog._id} 
                                        className="sidebar-item"
                                        onClick={() => handleBlogClick(blog.slug)}
                                    >
                                        {blog.title}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Latest Blogs */}
                        <div className="sidebar-section">
                            <h3 className="sidebar-title">Latest Blogs</h3>
                            <ul className="sidebar-list">
                                {latestBlogs.map(blog => (
                                    <li 
                                        key={blog._id} 
                                        className="sidebar-item"
                                        onClick={() => handleBlogClick(blog.slug)}
                                    >
                                        {blog.title}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Most Popular Blogs */}
                        <div className="sidebar-section">
                            <h3 className="sidebar-title">Most Popular Blogs</h3>
                            <ul className="sidebar-list">
                                {popularBlogs.map(blog => (
                                    <li 
                                        key={blog._id} 
                                        className="sidebar-item"
                                        onClick={() => handleBlogClick(blog.slug)}
                                    >
                                        {blog.title}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BlogsPage;
