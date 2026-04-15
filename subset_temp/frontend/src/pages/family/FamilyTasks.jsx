import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { staticAPI } from '../../utils/staticAPI';
import { syncContactsFromForm } from '../../utils/contactSyncUtil';
import { syncRemindersFromForm } from '../../utils/remindersSyncUtil';
import './static/Static.css';
import './FamilyTasks.css';

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

    </div>
  );
};
export default FamilyTasks;
