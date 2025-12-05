import React, { useState, useEffect } from 'react';
import { FiBell, FiClock, FiCalendar, FiRepeat, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiAlertCircle, FiMail, FiMessageSquare, FiPhone } from 'react-icons/fi';
import './RemindersNotifications.css';

const RemindersNotifications = () => {
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('reminders');
  const [filter, setFilter] = useState('all');
  
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    dateTime: '',
    type: 'one-time',
    repeat: 'daily',
    priority: 'medium',
    category: 'personal',
    method: 'email'
  });

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    scheduledTime: '',
    recipients: [],
    method: 'email'
  });

  useEffect(() => {
    // Load sample data
    setReminders([
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
      },
      {
        id: 2,
        title: 'Doctor Appointment',
        description: 'Annual health checkup',
        dateTime: '2024-12-20T14:30',
        type: 'one-time',
        repeat: 'none',
        priority: 'medium',
        category: 'health',
        method: 'notification',
        status: 'active'
      }
    ]);

    setNotifications([
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
    ]);
  }, []);

  const handleAddReminder = () => {
    if (newReminder.title && newReminder.dateTime) {
      const reminder = {
        ...newReminder,
        id: Date.now(),
        status: 'active'
      };
      setReminders([...reminders, reminder]);
      setNewReminder({
        title: '',
        description: '',
        dateTime: '',
        type: 'one-time',
        repeat: 'daily',
        priority: 'medium',
        category: 'personal',
        method: 'email'
      });
      setShowReminderModal(false);
    }
  };

  const handleAddNotification = () => {
    if (newNotification.title && newNotification.message) {
      const notification = {
        ...newNotification,
        id: Date.now(),
        status: 'scheduled',
        read: false
      };
      setNotifications([...notifications, notification]);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        scheduledTime: '',
        recipients: [],
        method: 'email'
      });
      setShowNotificationModal(false);
    }
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const toggleReminderStatus = (id) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r
    ));
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
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
    if (filter === 'all') return true;
    return reminder.category === filter;
  });

  const upcomingReminders = reminders
    .filter(r => r.status === 'active')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 5);

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

      <div className="content-layout">
        {/* Main Content */}
        <div className="main-content">
          {/* Tabs */}
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

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="filter-group">
              <label>Filter:</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="personal">Personal</option>
                <option value="bills">Bills</option>
                <option value="health">Health</option>
                <option value="work">Work</option>
                <option value="family">Family</option>
              </select>
            </div>
          </div>

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="reminders-list">
              {filteredReminders.length === 0 ? (
                <div className="empty-state">
                  <FiClock className="empty-icon" />
                  <h3>No reminders found</h3>
                  <p>Create your first reminder to get started</p>
                </div>
              ) : (
                filteredReminders.map(reminder => (
                  <div key={reminder.id} className={`reminder-card ${reminder.status}`}>
                    <div className="reminder-header">
                      <div className="reminder-title">
                        <h3>{reminder.title}</h3>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(reminder.priority) }}
                        >
                          {reminder.priority}
                        </span>
                      </div>
                      <div className="reminder-actions">
                        <button 
                          className={`status-btn ${reminder.status}`}
                          onClick={() => toggleReminderStatus(reminder.id)}
                        >
                          {reminder.status === 'active' ? <FiX /> : <FiCheck />}
                        </button>
                        <button className="delete-btn" onClick={() => deleteReminder(reminder.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    <p className="reminder-description">{reminder.description}</p>
                    <div className="reminder-meta">
                      <div className="meta-item">
                        <FiCalendar />
                        <span>{new Date(reminder.dateTime).toLocaleDateString()}</span>
                      </div>
                      <div className="meta-item">
                        <FiClock />
                        <span>{new Date(reminder.dateTime).toLocaleTimeString()}</span>
                      </div>
                      {reminder.type === 'recurring' && (
                        <div className="meta-item">
                          <FiRepeat />
                          <span>{reminder.repeat}</span>
                        </div>
                      )}
                      <div className="meta-item">
                        <span className="category-tag">{reminder.category}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <FiBell className="empty-icon" />
                  <h3>No notifications</h3>
                  <p>Your notifications will appear here</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-card ${!notification.read ? 'unread' : ''}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="notification-header">
                      <div className="notification-title">
                        <div className="notification-icon">
                          {getTypeIcon(notification.type)}
                        </div>
                        <h3>{notification.title}</h3>
                      </div>
                      <div className="notification-actions">
                        <button className="delete-btn" onClick={() => deleteNotification(notification.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <div className="notification-meta">
                      <div className="meta-item">
                        <FiClock />
                        <span>{new Date(notification.scheduledTime).toLocaleString()}</span>
                      </div>
                      <div className="meta-item">
                        <span className="status-badge">{notification.status}</span>
                      </div>
                      <div className="meta-item">
                        <span className="method-badge">{notification.method}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
    </div>   {/* Add Reminder Modal */}
      {showReminderModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Reminder</h3>
              <button onClick={() => setShowReminderModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  placeholder="Enter reminder title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newReminder.dateTime}
                    onChange={(e) => setNewReminder({ ...newReminder, dateTime: e.target.value })}
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
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newReminder.type}
                    onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })}
                  >
                    <option value="one-time">One Time</option>
                    <option value="recurring">Recurring</option>
                  </select>
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
              {newReminder.type === 'recurring' && (
                <div className="form-group">
                  <label>Repeat</label>
                  <select
                    value={newReminder.repeat}
                    onChange={(e) => setNewReminder({ ...newReminder, repeat: e.target.value })}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowReminderModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleAddReminder} className="btn-primary">Add Reminder</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Notification Modal */}
      {showNotificationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Send Notification</h3>
              <button onClick={() => setShowNotificationModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Enter notification title"
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  placeholder="Enter notification message"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Method</label>
                  <select
                    value={newNotification.method}
                    onChange={(e) => setNewNotification({ ...newNotification, method: e.target.value })}
                  >
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Scheduled Time</label>
                <input
                  type="datetime-local"
                  value={newNotification.scheduledTime}
                  onChange={(e) => setNewNotification({ ...newNotification, scheduledTime: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowNotificationModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleAddNotification} className="btn-primary">Send Notification</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersNotifications;
