import { useState, useEffect } from 'react';
import './AdminPages.css';

import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiStar } from 'react-icons/fi';
import '../investments/Investment.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CareerManagement = () => {
    const [careers, setCareers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCareer, setEditingCareer] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        department: 'Other',
        location: '',
        jobType: 'Full-time',
        experienceLevel: 'Entry Level',
        description: '',
        responsibilities: '',
        requirements: '',
        benefits: '',
        salaryMin: '',
        salaryMax: '',
        skills: '',
        applicationEmail: '',
        applicationUrl: '',
        applicationDeadline: '',
        published: false,
        featured: false
    });

    const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Customer Support', 'Finance', 'HR', 'Operations', 'Other'];
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
    const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', 'Director'];

    useEffect(() => {
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/careers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCareers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching careers:', error);
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
            const careerData = {
                ...formData,
                responsibilities: formData.responsibilities ? formData.responsibilities.split('\n').filter(r => r.trim()) : [],
                requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : [],
                benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : [],
                skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
                salaryRange: {
                    min: formData.salaryMin ? Number(formData.salaryMin) : 0,
                    max: formData.salaryMax ? Number(formData.salaryMax) : 0,
                    currency: 'INR'
                }
            };

            if (editingCareer) {
                await axios.put(`${API_URL}/careers/${editingCareer._id}`, careerData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/careers`, careerData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            fetchCareers();
            resetForm();
        } catch (error) {
            console.error('Error saving career:', error);
            alert('Error saving career: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (career) => {
        setEditingCareer(career);
        setFormData({
            title: career.title,
            slug: career.slug,
            department: career.department,
            location: career.location,
            jobType: career.jobType,
            experienceLevel: career.experienceLevel,
            description: career.description,
            responsibilities: career.responsibilities?.join('\n') || '',
            requirements: career.requirements?.join('\n') || '',
            benefits: career.benefits?.join('\n') || '',
            salaryMin: career.salaryRange?.min || '',
            salaryMax: career.salaryRange?.max || '',
            skills: career.skills?.join(', ') || '',
            applicationEmail: career.applicationEmail || '',
            applicationUrl: career.applicationUrl || '',
            applicationDeadline: career.applicationDeadline ? career.applicationDeadline.split('T')[0] : '',
            published: career.published,
            featured: career.featured
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this career opening?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/careers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCareers();
        } catch (error) {
            console.error('Error deleting career:', error);
        }
    };

    const togglePublish = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/careers/${id}/publish`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCareers();
        } catch (error) {
            console.error('Error toggling publish status:', error);
        }
    };

    const toggleFeatured = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/careers/${id}/featured`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCareers();
        } catch (error) {
            console.error('Error toggling featured status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            department: 'Other',
            location: '',
            jobType: 'Full-time',
            experienceLevel: 'Entry Level',
            description: '',
            responsibilities: '',
            requirements: '',
            benefits: '',
            salaryMin: '',
            salaryMax: '',
            skills: '',
            applicationEmail: '',
            applicationUrl: '',
            applicationDeadline: '',
            published: false,
            featured: false
        });
        setEditingCareer(null);
        setShowForm(false);
    };

    if (loading) return <div className="investment-container">Loading...</div>;

    return (
        <div className="investment-container">
            <div className="investment-header">
                <h1>Career Management</h1>
                <p>Create and manage job openings</p>
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
                    <FiPlus /> {showForm ? 'Cancel' : 'Add New Job Opening'}
                </button>
            </div>

            {showForm && (
                <div className="investment-section" style={{ marginBottom: '2rem' }}>
                    <h3>{editingCareer ? 'Edit Job Opening' : 'Create New Job Opening'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label>Job Title *</label>
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
                                <label>Department *</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Job Type *</label>
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    {jobTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Experience Level *</label>
                                <select
                                    name="experienceLevel"
                                    value={formData.experienceLevel}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    {experienceLevels.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label>Location *</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g., Mumbai, India or Remote"
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label>Job Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={6}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label>Responsibilities (one per line)</label>
                            <textarea
                                name="responsibilities"
                                value={formData.responsibilities}
                                onChange={handleInputChange}
                                rows={5}
                                placeholder="Write design specifications&#10;Collaborate with team&#10;Review code"
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label>Requirements (one per line)</label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleInputChange}
                                rows={5}
                                placeholder="Bachelor's degree in CS&#10;3+ years experience&#10;Strong JavaScript skills"
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label>Benefits (one per line)</label>
                            <textarea
                                name="benefits"
                                value={formData.benefits}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Health insurance&#10;Flexible hours&#10;Remote work option"
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label>Minimum Salary (INR/year)</label>
                                <input
                                    type="number"
                                    name="salaryMin"
                                    value={formData.salaryMin}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label>Maximum Salary (INR/year)</label>
                                <input
                                    type="number"
                                    name="salaryMax"
                                    value={formData.salaryMax}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label>Skills (comma-separated)</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleInputChange}
                                placeholder="React, Node.js, MongoDB, AWS"
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label>Application Email</label>
                                <input
                                    type="email"
                                    name="applicationEmail"
                                    value={formData.applicationEmail}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label>Application URL</label>
                                <input
                                    type="url"
                                    name="applicationUrl"
                                    value={formData.applicationUrl}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label>Application Deadline</label>
                                <input
                                    type="date"
                                    name="applicationDeadline"
                                    value={formData.applicationDeadline}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>

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
                                {editingCareer ? 'Update Job' : 'Create Job'}
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
                <h3>All Job Openings ({careers.length})</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f3f4f6' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Title</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Department</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Location</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Type</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Featured</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Applications</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {careers.map(career => (
                                <tr key={career._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>{career.title}</td>
                                    <td style={{ padding: '1rem' }}>{career.department}</td>
                                    <td style={{ padding: '1rem' }}>{career.location}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '8px',
                                            background: '#3b82f620',
                                            color: '#3b82f6',
                                            fontSize: '0.75rem'
                                        }}>
                                            {career.jobType}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            background: career.published ? '#10b98120' : '#ef444420',
                                            color: career.published ? '#10b981' : '#ef4444',
                                            fontSize: '0.875rem'
                                        }}>
                                            {career.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {career.featured && <FiStar fill="#f59e0b" color="#f59e0b" />}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{career.applications || 0}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => toggleFeatured(career._id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: career.featured ? '#f59e0b' : '#6b7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                title={career.featured ? 'Unfeature' : 'Feature'}
                                            >
                                                <FiStar />
                                            </button>
                                            <button
                                                onClick={() => togglePublish(career._id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: career.published ? '#f59e0b' : '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                title={career.published ? 'Unpublish' : 'Publish'}
                                            >
                                                {career.published ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(career)}
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
                                                onClick={() => handleDelete(career._id)}
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

export default CareerManagement;
