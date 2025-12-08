import React, { useState, useEffect } from 'react';
import { FiBell, FiClock, FiCalendar, FiRepeat, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiAlertCircle, FiMail, FiMessageSquare, FiPhone, FiFilter, FiSearch, FiSettings } from 'react-icons/fi';
import { investmentAPI } from '../../../utils/investmentAPI';
import './RemindersNotificationsSimple.css';

const RemindersNotifications = () => {
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('reminders');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dateTime: '',
    type: 'one-time',
    repeat: 'daily',
    priority: 'medium',
    category: 'personal',
    method: 'notification'
  });

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    scheduledTime: '',
    recipients: [],
    method: 'email'
  });

  const CATEGORY_KEY = 'reminders-notifications';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await investmentAPI.getAll(CATEGORY_KEY);
      const data = res.data.investments || [];
      
      const loadedReminders = [];
      const loadedNotifications = [];
      
      data.forEach(item => {
        const notes = item.notes ? JSON.parse(item.notes) : {};
        if (notes.itemType === 'reminder') {
          loadedReminders.push({
            id: item._id,
            ...notes,
            _id: item._id
          });
        } else if (notes.itemType === 'notification') {
          loadedNotifications.push({
            id: item._id,
            ...notes,
            _id: item._id
          });
        }
      });
      
      setReminders(loadedReminders);
      setNotifications(loadedNotifications);
    } catch (error) {
      console.error('Error fetching data:', error);
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleReminders = [
      {
        id: 1,
        title: 'Pay Electricity Bill',
        description: 'Monthly electricity bill payment',
        dateTime: '2024-12-15T10:00',
        type: 'recurring',
        repeat: 'monthly',
        priority: 'high',
        category: 'bills',
        method: 'notification',
        status: 'active'
      }
    ];

    const sampleNotifications = [
      {
        id: 1,
        title: 'Welcome to Family Finance',
        message: 'Your account has been successfully created',
        type: 'success',
        scheduledTime: '2024-12-01T09:00',
        method: 'app',
        status: 'sent',
        read: true
      }
    ];

    setReminders(sampleReminders);
    setNotifications(sampleNotifications);
  };

  const handleAddReminder = async () => {
    if (newReminder.title && newReminder.dateTime) {
      try {
        const reminderData = {
          ...newReminder,
          itemType: 'reminder',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        await investmentAPI.create({
          category: CATEGORY_KEY,
          type: 'Reminder',
          name: newReminder.title,
          amount: 0,
          startDate: new Date().toISOString().slice(0, 10),
          notes: JSON.stringify(reminderData)
        });
        
        await fetchData();
        resetReminderForm();
        setShowReminderModal(false);
      } catch (error) {
        console.error('Error adding reminder:', error);
      }
    }
  };

  const resetReminderForm = () => {
    setNewReminder({
      title: '',
      description: '',
      dateTime: '',
      type: 'one-time',
      repeat: 'daily',
      priority: 'medium',
      category: 'personal',
      method: 'notification'
    });
  };

  const deleteItem = async (id) => {
    try {
      await investmentAPI.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleReminderStatus = async (id) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      try {
        const updatedReminder = {
          ...reminder,
          status: reminder.status === 'active' ? 'paused' : 'active'
        };
        
        await investmentAPI.update(id, {
          category: CATEGORY_KEY,
          type: 'Reminder',
          name: reminder.title,
          amount: 0,
          startDate: new Date().toISOString().slice(0, 10),
          notes: JSON.stringify(updatedReminder)
        });
        
        await fetchData();
      } catch (error) {
        console.error('Error updating reminder:', error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'success': return <FiCheck className="icon-success" />;
      case 'warning': return <FiAlertCircle className="icon-warning" />;
      case 'error': return <FiX className="icon-error" />;
      default: return <FiBell className="icon-info" />;
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    const matchesFilter = filter === 'all' || reminder.category === filter;
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredNotifications = notifications.filter(notification => {
    return notification.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="reminders-notifications">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1><FiBell /> Reminders & Notifications</h1>
            <p>Manage your reminders and notifications efficiently</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowReminderModal(true)}>
              <FiPlus /> Add Reminder
            </button>
            <button className="btn-secondary" onClick={() => setShowNotificationModal(true)}>
              <FiPlus /> Send Notification
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="search-filter-bar">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {activeTab === 'reminders' && (
            <div className="filter-dropdown">
              <FiFilter />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="personal">Personal</option>
                <option value="bills">Bills</option>
                <option value="health">Health</option>
                <option value="work">Work</option>
                <option value="family">Family</option>
              </select>
            </div>
          )}
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setActiveTab('reminders')}
          >
            <FiClock /> Reminders ({reminders.length})
          </button>
          <button 
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FiBell /> Notifications ({notifications.length})
          </button>
        </div>

        <div className="tab-content">
          {loading ? (
            <div className="loading-state">
              <FiSettings className="loading-icon" />
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'reminders' && (
                <div className="table-container">
                  {filteredReminders.length === 0 ? (
                    <div className="empty-state">
                      <FiClock className="empty-icon" />
                      <h3>No reminders found</h3>
                      <button className="btn-primary" onClick={() => setShowReminderModal(true)}>
                        <FiPlus /> Add Reminder
                      </button>
                    </div>
                  ) : (
                    <table className="reminders-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Description</th>
                          <th>Date</th>
                          <th>Priority</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReminders.map(reminder => (
                          <tr key={reminder.id} className={`reminder-row ${reminder.status}`}>
                            <td>
                              <div className="title-cell">
                                <h4>{reminder.title}</h4>
                              </div>
                            </td>
                            <td>
                              <div className="description-cell">
                                <p>{reminder.description}</p>
                              </div>
                            </td>
                            <td>
                              <div className="date-cell">
                                <FiCalendar />
                                <span>{new Date(reminder.dateTime).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td>
                              <span 
                                className="priority-badge"
                                style={{ backgroundColor: getPriorityColor(reminder.priority) }}
                              >
                                {reminder.priority}
                              </span>
                            </td>
                            <td>
                              <span className="category-tag">{reminder.category}</span>
                            </td>
                            <td>
                              <span className={`status-badge ${reminder.status}`}>
                                {reminder.status}
                              </span>
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button 
                                  className={`status-btn ${reminder.status}`}
                                  onClick={() => toggleReminderStatus(reminder.id)}
                                >
                                  {reminder.status === 'active' ? <FiX /> : <FiCheck />}
                                </button>
                                <button 
                                  className="delete-btn" 
                                  onClick={() => deleteItem(reminder.id)}
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="table-container">
                  {filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                      <FiBell className="empty-icon" />
                      <h3>No notifications</h3>
                      <button className="btn-primary" onClick={() => setShowNotificationModal(true)}>
                        <FiPlus /> Send Notification
                      </button>
                    </div>
                  ) : (
                    <table className="notifications-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Title</th>
                          <th>Message</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNotifications.map(notification => (
                          <tr key={notification.id} className="notification-row">
                            <td>
                              <div className="type-cell">
                                {getTypeIcon(notification.type)}
                                <span>{notification.type}</span>
                              </div>
                            </td>
                            <td>
                              <div className="title-cell">
                                <h4>{notification.title}</h4>
                              </div>
                            </td>
                            <td>
                              <div className="message-cell">
                                <p>{notification.message}</p>
                              </div>
                            </td>
                            <td>
                              <div className="time-cell">
                                <FiClock />
                                <span>{new Date(notification.scheduledTime).toLocaleString()}</span>
                              </div>
                            </td>
                            <td>
                              <span className="status-badge">{notification.status}</span>
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button 
                                  className="delete-btn" 
                                  onClick={() => deleteItem(notification.id)}
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showReminderModal && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Reminder</h3>
              <button onClick={() => setShowReminderModal(false)} className="close-btn">
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    placeholder="Enter reminder title"
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newReminder.priority}
                    onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                    placeholder="Enter description"
                  />
                </div>
                <div className="form-group">
                  <label>Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={newReminder.dateTime}
                    onChange={(e) => setNewReminder({ ...newReminder, dateTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newReminder.category}
                    onChange={(e) => setNewReminder({ ...newReminder, category: e.target.value })}
                  >
                    <option value="personal">Personal</option>
                    <option value="bills">Bills</option>
                    <option value="health">Health</option>
                    <option value="work">Work</option>
                    <option value="family">Family</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowReminderModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleAddReminder} className="btn-primary">Add Reminder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersNotifications;
