import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { staticAPI } from '../../utils/staticAPI';
import { syncContactsFromForm } from '../../utils/contactSyncUtil';
import { syncRemindersFromForm } from '../../utils/remindersSyncUtil';
import './static/Static.css';

import { trackFeatureUsage, trackAction } from '../../utils/featureTracking';

const FamilyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    feature: '',
    subsection: '',
    dateOfTaskCreation: new Date().toISOString().slice(0, 10),
    taskDetailsDescription: '',
    dateForUpdate: '',
    updates: '',
    notes: '',
    status: 'pending',
    priority: 'medium'
  });

  const CATEGORY_KEY = 'family-tasks';

  useEffect(() => {
    trackFeatureUsage('/family/tasks', 'view');
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await staticAPI.getAll('family-tasks');
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload = {
        category: CATEGORY_KEY,
        type: 'Task',
        name: formData.taskDetailsDescription || formData.feature || 'Untitled Task',
        provider: formData.category || 'General',
        ...formData
      };

      if (editingId) {
        await staticAPI.update(editingId, payload);
      } else {
        await staticAPI.create('family-tasks', payload);
      }

      await fetchTasks();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setFormData({
      category: task.category || '',
      feature: task.feature || '',
      subsection: task.subsection || '',
      dateOfTaskCreation: task.dateOfTaskCreation || new Date().toISOString().slice(0, 10),
      taskDetailsDescription: task.taskDetailsDescription || '',
      dateForUpdate: task.dateForUpdate || '',
      updates: task.updates || '',
      notes: task.notes || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium'
    });
    setEditingId(task._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await staticAPI.delete(id);
        await fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      feature: '',
      subsection: '',
      dateOfTaskCreation: new Date().toISOString().slice(0, 10),
      taskDetailsDescription: '',
      dateForUpdate: '',
      updates: '',
      notes: '',
      status: 'pending',
      priority: 'medium'
    });
    setEditingId(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle style={{ color: '#10B981' }} />;
      case 'in-progress':
        return <FiClock style={{ color: '#F59E0B' }} />;
      case 'pending':
        return <FiAlertCircle style={{ color: '#EF4444' }} />;
      default:
        return <FiAlertCircle style={{ color: '#6B7280' }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="static-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="static-container">
      <div className="static-header">
        <div className="header-content">
          <div className="header-icon">
            <FiCalendar />
          </div>
          <div className="header-text">
            <h1>Tasks to Do</h1>
            <p>Manage and track all your family tasks and activities</p>
          </div>
        </div>
        <button 
          className="add-button"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          <FiPlus /> {showForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {showForm && (
        <div className="static-form-card">
          <h2>{editingId ? 'Edit Task' : 'Add New Task'}</h2>
          <form className="static-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category...</option>
                  <option value="Personal">Personal</option>
                  <option value="Family">Family</option>
                  <option value="Work">Work</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance</option>
                  <option value="Home">Home</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Travel">Travel</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Feature</label>
                <input
                  type="text"
                  value={formData.feature}
                  onChange={(e) => setFormData({ ...formData, feature: e.target.value })}
                  placeholder="e.g., Website Development, Event Planning"
                />
              </div>
              <div className="form-group">
                <label>Subsection</label>
                <input
                  type="text"
                  value={formData.subsection}
                  onChange={(e) => setFormData({ ...formData, subsection: e.target.value })}
                  placeholder="e.g., Frontend, Backend, Testing"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Task Creation *</label>
                <input
                  type="date"
                  value={formData.dateOfTaskCreation}
                  onChange={(e) => setFormData({ ...formData, dateOfTaskCreation: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date for Update</label>
                <input
                  type="date"
                  value={formData.dateForUpdate}
                  onChange={(e) => setFormData({ ...formData, dateForUpdate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Task Details & Description *</label>
              <textarea
                value={formData.taskDetailsDescription}
                onChange={(e) => setFormData({ ...formData, taskDetailsDescription: e.target.value })}
                placeholder="Provide detailed description of the task..."
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label>Updates</label>
              <textarea
                value={formData.updates}
                onChange={(e) => setFormData({ ...formData, updates: e.target.value })}
                placeholder="Any updates or progress notes..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or comments..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Update Task' : 'Create Task')}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="static-table-card">
        <div className="table-header">
          <h2>Tasks List ({tasks.length})</h2>
        </div>
        <div className="table-container">
          <table className="static-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Feature</th>
                <th>Subsection</th>
                <th>Date of Task Creation</th>
                <th>Task Details & Description</th>
                <th>Date for Update</th>
                <th>Updates</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="11" className="no-data">
                    No tasks found. Click "Add Task" to get started.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <span className="category-badge">{task.category || 'N/A'}</span>
                    </td>
                    <td>{task.feature || '-'}</td>
                    <td>{task.subsection || '-'}</td>
                    <td>{task.dateOfTaskCreation || '-'}</td>
                    <td>
                      <div className="task-details">
                        {task.taskDetailsDescription || '-'}
                      </div>
                    </td>
                    <td>{task.dateForUpdate || '-'}</td>
                    <td>
                      <div className="updates-text">
                        {task.updates ? (
                          <span title={task.updates}>
                            {task.updates.length > 50 
                              ? `${task.updates.substring(0, 50)}...` 
                              : task.updates}
                          </span>
                        ) : '-'}
                      </div>
                    </td>
                    <td>
                      <div className="notes-text">
                        {task.notes ? (
                          <span title={task.notes}>
                            {task.notes.length > 30 
                              ? `${task.notes.substring(0, 30)}...` 
                              : task.notes}
                          </span>
                        ) : '-'}
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(task.status)}
                        <span className="status-text">{task.status || 'pending'}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {task.priority || 'medium'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(task)}
                          title="Edit Task"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(task._id)}
                          title="Delete Task"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .static-container {
          padding: 20px;
          max-width: 100%;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .static-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 16px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-icon {
          background: rgba(255,255,255,0.2);
          padding: 15px;
          border-radius: 12px;
          font-size: 24px;
        }

        .header-text h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: white;
        }

        .header-text p {
          margin: 0;
          opacity: 0.9;
          font-size: 16px;
          color: white;
        }

        .add-button {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .add-button:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        .static-form-card {
          background: white;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
        }

        .static-form-card h2 {
          margin: 0 0 25px 0;
          color: #1e293b;
          font-size: 22px;
          font-weight: 700;
          padding-bottom: 15px;
          border-bottom: 2px solid #f1f5f9;
        }

        .static-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: #f9fafb;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102,126,234,0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #e5e7eb;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
          border-color: #d1d5db;
        }

        .static-table-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .table-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 25px 30px;
          border-bottom: 2px solid #e2e8f0;
        }

        .table-header h2 {
          margin: 0;
          color: #1e293b;
          font-size: 20px;
          font-weight: 700;
        }

        .table-container {
          overflow-x: auto;
          max-width: 100%;
          -webkit-overflow-scrolling: touch;
          max-height: 70vh;
        }

        .static-table {
          width: 100%;
          min-width: 1600px;
          border-collapse: collapse;
          table-layout: auto;
        }

        .static-table th {
          background: #f8fafc;
          padding: 16px 15px;
          text-align: left;
          font-weight: 700;
          color: #374151;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 2px solid #e2e8f0;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 10;
          min-width: 120px;
        }

        .static-table td {
          padding: 16px 15px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          color: #4b5563;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 120px;
        }

        .static-table tbody tr:hover {
          background: #f8fafc;
          transform: scale(1.01);
        }

        .category-badge {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
          text-transform: capitalize;
          border: 1px solid #93c5fd;
        }

        .task-details {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;
          color: #374151;
        }

        .updates-text, .notes-text {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #6b7280;
          font-size: 13px;
        }

        .status-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-text {
          font-size: 12px;
          text-transform: capitalize;
          font-weight: 600;
        }

        .priority-badge {
          color: white;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .edit-btn, .delete-btn {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .edit-btn:hover {
          background: #dbeafe;
          border-color: #3b82f6;
          color: #3b82f6;
          transform: scale(1.1);
        }

        .delete-btn {
          background: #fee2e2;
          border: 2px solid #ef4444;
          color: #ef4444;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn:hover {
          background: #fecaca;
          border-color: #dc2626;
          color: #dc2626;
          transform: scale(1.1);
        }

        .no-data {
          text-align: center;
          padding: 60px;
          color: #6b7280;
          font-size: 16px;
          background: #f8fafc;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #6b7280;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .static-container {
            padding: 15px;
            overflow-x: hidden;
          }

          .static-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .static-table {
            min-width: 800px;
            font-size: 12px;
          }

          .static-table th,
          .static-table td {
            padding: 10px 8px;
          }

          .task-details {
            max-width: 120px;
          }

          .updates-text, .notes-text {
            max-width: 60px;
          }
        }
      `}</style>
    </div>
  );
};
export default FamilyTasks;
