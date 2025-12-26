import { useState, useEffect } from 'react';
import './AdminPages.css';

import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiStar } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';
import '../investments/Investment.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const SuccessStoriesManagement = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStory, setEditingStory] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        customerName: '',
        customerRole: '',
        customerImage: '',
        customerLocation: '',
        category: 'Other',
        excerpt: '',
        story: '',
        results: '',
        testimonial: '',
        featuredImage: '',
        published: false,
        featured: false,
        rating: 5
    });

    const categories = ['Investment Success', 'Debt Free', 'Financial Goal Achieved', 'Business Growth', 'Retirement Planning', 'Other'];

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/success-stories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStories(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stories:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            if (editingStory) {
                await axios.put(`${API_URL}/success-stories/${editingStory._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/success-stories`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            fetchStories();
            resetForm();
        } catch (error) {
            console.error('Error saving story:', error);
            alert('Error saving story: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (story) => {
        setEditingStory(story);
        setFormData({
            title: story.title,
            slug: story.slug,
            customerName: story.customerName,
            customerRole: story.customerRole || '',
            customerImage: story.customerImage || '',
            customerLocation: story.customerLocation || '',
            category: story.category,
            excerpt: story.excerpt,
            story: story.story,
            results: story.results || '',
            testimonial: story.testimonial || '',
            featuredImage: story.featuredImage || '',
            published: story.published,
            featured: story.featured,
            rating: story.rating
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this success story?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/success-stories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStories();
        } catch (error) {
            console.error('Error deleting story:', error);
        }
    };

    const togglePublish = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/success-stories/${id}/publish`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStories();
        } catch (error) {
            console.error('Error toggling publish status:', error);
        }
    };

    const toggleFeatured = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/success-stories/${id}/featured`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStories();
        } catch (error) {
            console.error('Error toggling featured status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            customerName: '',
            customerRole: '',
            customerImage: '',
            customerLocation: '',
            category: 'Other',
            excerpt: '',
            story: '',
            results: '',
            testimonial: '',
            featuredImage: '',
            published: false,
            featured: false,
            rating: 5
        });
        setEditingStory(null);
        setShowForm(false);
    };

    if (loading) return <div className="investment-container">Loading...</div>;

    return (
        <div className="investment-container">
            <div className="investment-header">
                <h1>Success Stories Management</h1>
                <p>Create and manage customer success stories</p>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <FiPlus /> {showForm ? 'Cancel' : 'Add New Success Story'}
                </button>
            </div>

            {showForm && (
                <div className="investment-section" style={{ marginBottom: '2rem' }}>
                    <h3>{editingStory ? 'Edit Success Story' : 'Create New Success Story'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label>Slug *</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label>Customer Name *</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label>Customer Role</label>
                                <input
                                    type="text"
                                    name="customerRole"
                                    value={formData.customerRole}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label>Customer Location</label>
                                <input
                                    type="text"
                                    name="customerLocation"
                                    value={formData.customerLocation}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label>Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Rating *</label>
                                <select
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    {[5, 4, 3, 2, 1].map(r => (
                                        <option key={r} value={r}>{r} Stars</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label>Excerpt * (Max 300 characters)</label>
                            <textarea
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleInputChange}
                                required
                                maxLength={300}
                                rows={3}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label>Story *</label>
                            <textarea
                                name="story"
                                value={formData.story}
                                onChange={handleInputChange}
                                required
                                rows={8}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label>Results Achieved</label>
                            <textarea
                                name="results"
                                value={formData.results}
                                onChange={handleInputChange}
                                rows={4}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label>Customer Testimonial</label>
                            <textarea
                                name="testimonial"
                                value={formData.testimonial}
                                onChange={handleInputChange}
                                rows={3}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <ImageUpload
                            label="Customer Image"
                            name="customerImage"
                            value={formData.customerImage}
                            onChange={handleInputChange}
                        />

                        <ImageUpload
                            label="Featured Image"
                            name="featuredImage"
                            value={formData.featuredImage}
                            onChange={handleInputChange}
                        />

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    name="published"
                                    checked={formData.published}
                                    onChange={handleInputChange}
                                />
                                <label>Publish immediately</label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleInputChange}
                                />
                                <label>Mark as featured</label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '0.75rem 2rem',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                {editingStory ? 'Update Story' : 'Create Story'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                style={{
                                    padding: '0.75rem 2rem',
                                    background: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="investment-section">
                <h3>All Success Stories ({stories.length})</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f3f4f6' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Title</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Rating</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Featured</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Views</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stories.map(story => (
                                <tr key={story._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>{story.title}</td>
                                    <td style={{ padding: '1rem' }}>{story.customerName}</td>
                                    <td style={{ padding: '1rem' }}>{story.category}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                                            {[...Array(story.rating)].map((_, i) => (
                                                <FiStar key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            background: story.published ? '#10b98120' : '#ef444420',
                                            color: story.published ? '#10b981' : '#ef4444',
                                            fontSize: '0.875rem'
                                        }}>
                                            {story.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {story.featured && <FiStar fill="#f59e0b" color="#f59e0b" />}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{story.views || 0}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => toggleFeatured(story._id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: story.featured ? '#f59e0b' : '#6b7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                title={story.featured ? 'Unfeature' : 'Feature'}
                                            >
                                                <FiStar />
                                            </button>
                                            <button
                                                onClick={() => togglePublish(story._id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: story.published ? '#f59e0b' : '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                title={story.published ? 'Unpublish' : 'Publish'}
                                            >
                                                {story.published ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(story)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                title="Edit"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(story._id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                title="Delete"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuccessStoriesManagement;
