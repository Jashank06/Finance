import React, { useState, useEffect } from 'react';
import { FiBell, FiClock, FiCalendar, FiRepeat, FiPlus, FiTrash2, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
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
      case 'success': return <FiCheck className="type-icon success" />;
      case 'warning': return <FiAlertCircle className="type-icon warning" />;
      case 'error': return <FiX className="type-icon error" />;
      default: return <FiBell className="type-icon info" />;
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    return reminder.category === filter;
  });

  return (
    <div className="reminders-page">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <FiBell />
          </div>
          <div>
            <h1>Reminders & Notifications</h1>
            <p>Manage your reminders and notifications efficiently</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowReminderModal(true)}>
            <FiPlus /> Add Reminder
          </button>
          <button className="btn btn-outline" onClick={() => setShowNotificationModal(true)}>
            <FiPlus /> Send Notification
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="tabs-container">
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
        
        {activeTab === 'reminders' && (
          <div className="filter-section">
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
        )}
      </div>

      {/* Content Section */}
      <div className="content-section">
        {activeTab === 'reminders' ? (
          <div className="table-wrapper">
            {filteredReminders.length === 0 ? (
              <div className="empty-state">
                <FiClock />
                <h3>No reminders found</h3>
                <p>Create your first reminder to get started</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Priority</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReminders.map(reminder => (
                    <tr key={reminder.id}>
                      <td><strong>{reminder.title}</strong></td>
                      <td className="description">{reminder.description}</td>
                      <td>
                        <div className="cell-content">
                          <FiCalendar />
                          {new Date(reminder.dateTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="cell-content">
                          <FiClock />
                          {new Date(reminder.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td>
                        <span 
                          className="badge priority"
                          style={{ backgroundColor: getPriorityColor(reminder.priority) }}
                        >
                          {reminder.priority}
                        </span>
                      </td>
                      <td>
                        <span className="badge category">{reminder.category}</span>
                      </td>
                      <td>
                        <div className="cell-content">
                          {reminder.type === 'recurring' ? (
                            <>
                              <FiRepeat />
                              {reminder.repeat}
                            </>
                          ) : (
                            'One Time'
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge status ${reminder.status}`}>
                          {reminder.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className={`icon-btn ${reminder.status}`}
                            onClick={() => toggleReminderStatus(reminder.id)}
                            title={reminder.status === 'active' ? 'Pause' : 'Activate'}
                          >
                            {reminder.status === 'active' ? <FiX /> : <FiCheck />}
                          </button>
                          <button 
                            className="icon-btn delete"
                            onClick={() => deleteReminder(reminder.id)}
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
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <FiBell />
                <h3>No notifications</h3>
                <p>Your notifications will appear here</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Scheduled Time</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Read</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(notification => (
                    <tr 
                      key={notification.id}
                      className={!notification.read ? 'unread' : ''}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <td>
                        <div className="cell-content">
                          {getTypeIcon(notification.type)}
                          {notification.type}
                        </div>
                      </td>
                      <td><strong>{notification.title}</strong></td>
                      <td className="description">{notification.message}</td>
                      <td>
                        <div className="cell-content">
                          <FiClock />
                          {new Date(notification.scheduledTime).toLocaleString()}
                        </div>
                      </td>
                      <td><span className="badge">{notification.method}</span></td>
                      <td><span className="badge status">{notification.status}</span></td>
                      <td>
                        <span className={`badge ${notification.read ? 'read' : 'unread'}`}>
                          {notification.read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="icon-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
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
            )}
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {showReminderModal && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Reminder</h3>
              <button className="close-btn" onClick={() => setShowReminderModal(false)}>×</button>
            </div>
            <div className="modal-body">
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
                <label>Description</label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date & Time *</label>
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
              <button className="btn btn-outline" onClick={() => setShowReminderModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddReminder}>Add Reminder</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Notification Modal */}
      {showNotificationModal && (
        <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Notification</h3>
              <button className="close-btn" onClick={() => setShowNotificationModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Enter notification title"
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  placeholder="Enter notification message"
                  rows="4"
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
                    <option value="app">App</option>
                    <option value="sms">SMS</option>
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
              <button className="btn btn-outline" onClick={() => setShowNotificationModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddNotification}>Send Notification</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersNotifications;
