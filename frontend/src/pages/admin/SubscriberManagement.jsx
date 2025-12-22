import { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import '../investments/Investment.css';

const SubscriberManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data - replace with API call
    const subscribers = [
        { id: 1, name: 'Jay Sharma', email: 'jay@example.com', plan: 'Premium', status: 'Active', joined: '2024-01-15' },
        { id: 2, name: 'Rahul Kumar', email: 'rahul@example.com', plan: 'Basic', status: 'Active', joined: '2024-02-20' },
        { id: 3, name: 'Priya Patel', email: 'priya@example.com', plan: 'Pro', status: 'Inactive', joined: '2024-03-10' }
    ];

    return (
        <div className="investment-container">
            <div className="investment-header">
                <h1>Subscriber Management</h1>
                <p>Manage all platform subscribers</p>
            </div>

            <div className="investment-section">
                <div className="section-header">
                    <div style={{ flex: 1 }}>
                        <h3>All Subscribers</h3>
                        <p className="section-subtitle">{subscribers.length} total subscribers</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                            <input
                                type="text"
                                placeholder="Search subscribers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    paddingLeft: '2.5rem',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    width: '250px'
                                }}
                            />
                        </div>
                        <button className="add-button">
                            <FiPlus /> Add Subscriber
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="investments-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Plan</th>
                                <th>Status</th>
                                <th>Joined Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map(sub => (
                                <tr key={sub.id}>
                                    <td>{sub.id}</td>
                                    <td><strong>{sub.name}</strong></td>
                                    <td>{sub.email}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            background: sub.plan === 'Premium' ? '#10b98115' : '#3b82f615',
                                            color: sub.plan === 'Premium' ? '#10b981' : '#3b82f6',
                                            fontWeight: '500'
                                        }}>
                                            {sub.plan}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            background: sub.status === 'Active' ? '#10b98115' : '#ef444415',
                                            color: sub.status === 'Active' ? '#10b981' : '#ef4444',
                                            fontWeight: '500'
                                        }}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td>{new Date(sub.joined).toLocaleDateString('en-IN')}</td>
                                    <td>
                                        <div className="investment-actions">
                                            <button className="btn-icon" title="Edit">
                                                <FiEdit />
                                            </button>
                                            <button className="btn-icon btn-danger" title="Delete">
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

export default SubscriberManagement;
