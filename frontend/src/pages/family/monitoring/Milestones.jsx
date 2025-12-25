import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './MonitoringPages.css';
import './Roadmap.css';

const Milestones = () => {
    const [loading, setLoading] = useState(false);
    const [milestones, setMilestones] = useState([]);
    const [showMilestoneForm, setShowMilestoneForm] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [activeTab, setActiveTab] = useState('roadmap');
    const [milestoneForm, setMilestoneForm] = useState({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'planning',
        priority: 'medium',
        assignedTo: '',
        progress: 0,
        tasks: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const milestoneRes = await api.get('/budget/milestones');
            setMilestones(milestoneRes.data || []);
        } catch (error) {
            console.error('Error fetching milestones:', error);
        }
        setLoading(false);
    };

    const resetMilestoneForm = () => {
        setMilestoneForm({
            title: '',
            description: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            status: 'planning',
            priority: 'medium',
            assignedTo: '',
            progress: 0,
            tasks: []
        });
        setEditingMilestone(null);
    };

    const handleMilestoneSave = async () => {
        try {
            if (editingMilestone) {
                await api.put(`/budget/milestones/${editingMilestone._id}`, milestoneForm);
            } else {
                await api.post('/budget/milestones', milestoneForm);
            }
            fetchData();
            setShowMilestoneForm(false);
            resetMilestoneForm();
        } catch (error) {
            console.error('Error saving milestone:', error);
            alert('Error saving milestone');
        }
    };

    const handleMilestoneEdit = (record) => {
        setMilestoneForm(record);
        setEditingMilestone(record);
        setShowMilestoneForm(true);
    };

    const handleMilestoneDelete = async (id) => {
        if (confirm('Are you sure you want to delete this milestone?')) {
            try {
                await api.delete(`/budget/milestones/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting milestone:', error);
                alert('Error deleting milestone');
            }
        }
    };

    const sortedMilestones = [...milestones].sort((a, b) =>
        new Date(a.startDate) - new Date(b.startDate)
    );

    const getStatusColor = (status) => {
        const colors = {
            'planning': '#9c27b0',
            'in-progress': '#ff9800',
            'completed': '#4caf50',
            'on-hold': '#ffc107',
            'cancelled': '#f44336'
        };
        return colors[status] || '#9c27b0';
    };

    const getCurrentMilestone = () => {
        const inProgress = sortedMilestones.find(m => m.status === 'in-progress');
        if (inProgress) return sortedMilestones.indexOf(inProgress);

        const lastCompleted = sortedMilestones.filter(m => m.status === 'completed').length;
        return lastCompleted < sortedMilestones.length ? lastCompleted : sortedMilestones.length - 1;
    };

    const getOverallProgress = () => {
        if (sortedMilestones.length === 0) return 0;
        const totalProgress = sortedMilestones.reduce((acc, m) => {
            if (m.status === 'completed') return acc + 100;
            if (m.status === 'in-progress') return acc + m.progress;
            return acc;
        }, 0);
        return Math.round(totalProgress / sortedMilestones.length);
    };

    const renderRoadmap = () => {
        if (sortedMilestones.length === 0) {
            return (
                <div className="roadmap-empty">
                    <div className="empty-state">
                        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <h3>No Milestones Yet</h3>
                        <p>Create your first milestone to see it on the roadmap</p>
                    </div>
                </div>
            );
        }

        const currentIndex = getCurrentMilestone();
        const overallProgress = getOverallProgress();

        return (
            <div className="roadmap-map-container">
                <div className="journey-header">
                    <div className="journey-stats">
                        <div className="stat-item">
                            <div className="stat-icon total">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h4>{sortedMilestones.length}</h4>
                                <p>Total Milestones</p>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon completed">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h4>{sortedMilestones.filter(m => m.status === 'completed').length}</h4>
                                <p>Completed</p>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon in-progress">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h4>{sortedMilestones.filter(m => m.status === 'in-progress').length}</h4>
                                <p>In Progress</p>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon planning">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h4>{overallProgress}%</h4>
                                <p>Overall Progress</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="map-canvas">
                    {/* Horizontal Timeline Track */}
                    <div className="timeline-track">
                        <div 
                            className="timeline-progress" 
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>

                    {/* Milestone Nodes */}
                    {sortedMilestones.map((milestone, index) => {
                        const isCompleted = milestone.status === 'completed';
                        const isCurrent = index === currentIndex;
                        const isPending = !isCompleted && !isCurrent;
                        
                        // Calculate horizontal position (evenly spaced)
                        const totalMilestones = sortedMilestones.length;
                        const leftPosition = ((index + 1) / (totalMilestones + 1)) * 100;

                        return (
                            <div
                                key={milestone._id}
                                className={`map-milestone ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
                                style={{ left: `${leftPosition}%` }}
                            >
                                <div className="milestone-pin">
                                    <div className="milestone-pin-inner">
                                        {isCompleted && '✓'}
                                        {isCurrent && '●'}
                                        {isPending && (index + 1)}
                                    </div>
                                    {isCurrent && (
                                        <div className="current-pulse"></div>
                                    )}
                                </div>

                                <div className="milestone-label">
                                    {milestone.title}
                                </div>

                                <div className="milestone-tooltip">
                                    <div className="tooltip-header">
                                        <h4>{milestone.title}</h4>
                                        <span className={`mini-badge ${milestone.status}`}>
                                            {milestone.status === 'completed' ? '✓' : milestone.status === 'in-progress' ? '•••' : '○'}
                                        </span>
                                    </div>
                                    <p className="tooltip-description">{milestone.description}</p>
                                    <div className="tooltip-meta">
                                        <span className="tooltip-date">
                                            📅 {new Date(milestone.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        {milestone.assignedTo && (
                                            <span className="tooltip-assignee">👤 {milestone.assignedTo}</span>
                                        )}
                                    </div>
                                    <div className="tooltip-progress">
                                        <div className="mini-progress-bar">
                                            <div
                                                className="mini-progress-fill"
                                                style={{
                                                    width: `${milestone.progress}%`,
                                                    backgroundColor: getStatusColor(milestone.status)
                                                }}
                                            ></div>
                                        </div>
                                        <span className="progress-text">{milestone.progress}%</span>
                                    </div>
                                    <button
                                        className="tooltip-edit-btn"
                                        onClick={() => handleMilestoneEdit(milestone)}
                                    >
                                        ✏️ Edit
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="loading">Loading data...</div>;
    }

    return (
        <div className="monitoring-container">
            <div className="section-header">
                <h2>Milestone & Task Timeline</h2>
                <button
                    className="add-btn"
                    onClick={() => {
                        resetMilestoneForm();
                        setShowMilestoneForm(true);
                    }}
                >
                    Add Milestone
                </button>
            </div>

            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'roadmap' ? 'active' : ''}`}
                        onClick={() => setActiveTab('roadmap')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Roadmap
                    </button>
                    <button
                        className={`tab ${activeTab === 'table' ? 'active' : ''}`}
                        onClick={() => setActiveTab('table')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Table View
                    </button>
                </div>
            </div>

            {showMilestoneForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingMilestone ? 'Edit' : 'Add'} Milestone</h3>
                            <button onClick={() => setShowMilestoneForm(false)} className="close-btn">×</button>
                        </div>
                        <div className="milestone-form-grid">
                            <div className="form-group" style={{ gridColumn: 'span 3' }}>
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={milestoneForm.title}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 3' }}>
                                <label>Description</label>
                                <textarea
                                    value={milestoneForm.description}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={milestoneForm.startDate}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, startDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={milestoneForm.endDate}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, endDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={milestoneForm.status}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                                >
                                    <option value="planning">Planning</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="on-hold">On Hold</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <select
                                    value={milestoneForm.priority}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Assigned To</label>
                                <input
                                    type="text"
                                    value={milestoneForm.assignedTo}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, assignedTo: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Progress (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={milestoneForm.progress}
                                    onChange={(e) => setMilestoneForm({ ...milestoneForm, progress: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowMilestoneForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="save-btn"
                                onClick={handleMilestoneSave}
                            >
                                {editingMilestone ? 'Update' : 'Save'} Milestone
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'roadmap' ? (
                renderRoadmap()
            ) : (
                <div className="table-container">
                    {milestones.length === 0 ? (
                        <div className="no-data">No milestones found.</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Dates</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Assigned To</th>
                                    <th>Progress</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {milestones.map((record) => (
                                    <tr key={record._id}>
                                        <td>
                                            <strong>{record.title}</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{record.description}</div>
                                        </td>
                                        <td>
                                            {new Date(record.startDate).toLocaleDateString()}
                                            {record.endDate && ` - ${new Date(record.endDate).toLocaleDateString()}`}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${record.status}`}>
                                                {record.status.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`priority-badge ${record.priority}`}>
                                                {record.priority}
                                            </span>
                                        </td>
                                        <td>{record.assignedTo}</td>
                                        <td>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${record.progress}%` }}
                                                ></div>
                                                <span>{record.progress}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleMilestoneEdit(record)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleMilestoneDelete(record._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default Milestones;
