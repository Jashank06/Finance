import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './MonitoringPages.css';

const Milestones = () => {
    const [loading, setLoading] = useState(false);
    const [milestones, setMilestones] = useState([]);
    const [showMilestoneForm, setShowMilestoneForm] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
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
        </div>
    );
};

export default Milestones;
