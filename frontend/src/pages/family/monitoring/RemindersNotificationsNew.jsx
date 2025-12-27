import React, { useState, useEffect } from 'react';
import { FiBell, FiClock, FiCalendar, FiRepeat, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiAlertCircle, FiMail, FiMessageSquare, FiPhone, FiFilter, FiSearch, FiChevronDown, FiSettings, FiTrendingUp, FiBarChart2, FiActivity } from 'react-icons/fi';
import { investmentAPI } from '../../../utils/investmentAPI';
import './RemindersNotifications.css';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const RemindersNotifications = () => {
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('reminders');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalReminders: 0,
    activeReminders: 0,
    totalNotifications: 0,
    unreadNotifications: 0
  });
  
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
    trackFeatureUsage('/family/monitoring/reminders-notifications', 'view');
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
      updateStats(loadedReminders, loadedNotifications);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Load sample data on error
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
    updateStats(sampleReminders, sampleNotifications);
  };

  const updateStats = (reminders, notifications) => {
    setStats({
      totalReminders: reminders.length,
      activeReminders: reminders.filter(r => r.status === 'active').length,
      totalNotifications: notifications.length,
      unreadNotifications: notifications.filter(n => !n.read).length
    });
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

  const handleAddNotification = async () => {
    if (newNotification.title && newNotification.message) {
      try {
        const notificationData = {
          ...newNotification,
          itemType: 'notification',
          status: 'scheduled',
          read: false,
          createdAt: new Date().toISOString()
        };
        
        await investmentAPI.create({
          category: CATEGORY_KEY,
          type: 'Notification',
          name: newNotification.title,
          amount: 0,
          startDate: new Date().toISOString().slice(0, 10),
          notes: JSON.stringify(notificationData)
        });
        
        await fetchData();
        resetNotificationForm();
        setShowNotificationModal(false);
      } catch (error) {
        console.error('Error adding notification:', error);
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

  const resetNotificationForm = () => {
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      scheduledTime: '',
      recipients: [],
      method: 'email'
    });
  };

  const deleteItem = async (id, type) => {
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

  const markNotificationAsRead = async (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      try {
        const updatedNotification = {
          ...notification,
          read: true
        };
        
        await investmentAPI.update(id, {
          category: CATEGORY_KEY,
          type: 'Notification',
          name: notification.title,
          amount: 0,
          startDate: new Date().toISOString().slice(0, 10),
          notes: JSON.stringify(updatedNotification)
        });
        
        await fetchData();
      } catch (error) {
        console.error('Error updating notification:', error);
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
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const upcomingReminders = reminders
    .filter(r => r.status === 'active')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 5);

  return (
    <div className="reminders-notifications">
      {/* Header */}
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

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>{stats.totalReminders}</h3>
            <p>Total Reminders</p>
          </div>
          <div className="stat-badge">
            {stats.activeReminders} active
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">
            <FiCheck />
          </div>
          <div className="stat-content">
            <h3>{stats.activeReminders}</h3>
            <p>Active Reminders</p>
          </div>
          <div className="stat-progress">
            <div 
              className="progress-fill" 
              style={{ width: `${stats.totalReminders > 0 ? (stats.activeReminders / stats.totalReminders) * 100 : 0}%` }}
            />
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">
            <FiBell />
          </div>
          <div className="stat-content">
            <h3>{stats.totalNotifications}</h3>
            <p>Total Notifications</p>
          </div>
          <div className="stat-badge">
            {stats.unreadNotifications} unread
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.unreadNotifications}</h3>
            <p>Unread Messages</p>
          </div>
          <div className="stat-indicator">
            {stats.unreadNotifications > 0 && <span className="pulse"></span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-section">
            <h3><FiTrendingUp /> Quick Stats</h3>
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="label">Today</span>
                <span className="value">{upcomingReminders.filter(r => {
                  const today = new Date().toDateString();
                  const reminderDate = new Date(r.dateTime).toDateString();
                  return today === reminderDate;
                }).length}</span>
              </div>
              <div className="quick-stat">
                <span className="label">This Week</span>
                <span className="value">{upcomingReminders.filter(r => {
                  const now = new Date();
                  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                  const reminderDate = new Date(r.dateTime);
                  return reminderDate >= now && reminderDate <= weekFromNow;
                }).length}</span>
              </div>
              <div className="quick-stat">
                <span className="label">High Priority</span>
                <span className="value">{reminders.filter(r => r.priority === 'high' && r.status === 'active').length}</span>
              </div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3><FiCalendar /> Upcoming</h3>
            <div className="upcoming-list">
              {upcomingReminders.slice(0, 3).map(reminder => (
                <div key={reminder.id} className="upcoming-item">
                  <div className="upcoming-time">
                    {new Date(reminder.dateTime).toLocaleDateString()}
                  </div>
                  <div className="upcoming-title">{reminder.title}</div>
                  <div className="upcoming-priority" style={{ color: getPriorityColor(reminder.priority) }}>
                    {reminder.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Search and Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search reminders or notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
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
          </div>

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

          {/* Content */}
          <div className="tab-content">
            {loading ? (
              <div className="loading-state">
                <FiActivity className="loading-icon" />
                <p>Loading your reminders and notifications...</p>
              </div>
            ) : (
              <>
                {/* Reminders Tab */}
                {activeTab === 'reminders' && (
                  <div className="items-grid">
                    {filteredReminders.length === 0 ? (
                      <div className="empty-state">
                        <FiClock className="empty-icon" />
                        <h3>No reminders found</h3>
                        <p>Create your first reminder to get started</p>
                        <button className="btn-primary" onClick={() => setShowReminderModal(true)}>
                          <FiPlus /> Add Your First Reminder
                        </button>
                      </div>
                    ) : (
                      filteredReminders.map(reminder => (
                        <div key={reminder.id} className={`reminder-card ${reminder.status}`}>
                          <div className="card-header">
                            <div className="card-title">
                              <h4>{reminder.title}</h4>
                              <span 
                                className="priority-badge"
                                style={{ backgroundColor: getPriorityColor(reminder.priority) }}
                              >
                                {reminder.priority}
                              </span>
                            </div>
                            <div className="card-actions">
                              <button 
                                className={`status-btn ${reminder.status}`}
                                onClick={() => toggleReminderStatus(reminder.id)}
                                title={reminder.status === 'active' ? 'Pause' : 'Activate'}
                              >
                                {reminder.status === 'active' ? <FiX /> : <FiCheck />}
                              </button>
                              <button 
                                className="delete-btn" 
                                onClick={() => deleteItem(reminder.id, 'reminder')}
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                          
                          <div className="card-description">
                            <p>{reminder.description}</p>
                          </div>
                          
                          <div className="card-meta">
                            <div className="meta-item">
                              <FiCalendar />
                              <span>{new Date(reminder.dateTime).toLocaleDateString()}</span>
                            </div>
                            <div className="meta-item">
                              <FiClock />
                              <span>{new Date(reminder.dateTime).toLocaleTimeString()}</span>
                            </div>
                            <div className="meta-item">
                              <span className="category-tag">{reminder.category}</span>
                            </div>
                            {reminder.type === 'recurring' && (
                              <div className="meta-item">
                                <FiRepeat />
                                <span>{reminder.repeat}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="card-footer">
                            <span className={`status-badge ${reminder.status}`}>
                              {reminder.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="items-grid">
                    {filteredNotifications.length === 0 ? (
                      <div className="empty-state">
                        <FiBell className="empty-icon" />
                        <h3>No notifications</h3>
                        <p>Your notifications will appear here</p>
                        <button className="btn-primary" onClick={() => setShowNotificationModal(true)}>
                          <FiPlus /> Send Your First Notification
                        </button>
                      </div>
                    ) : (
                      filteredNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-card ${!notification.read ? 'unread' : ''}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="card-header">
                            <div className="card-title">
                              <div className="notification-icon">
                                {getTypeIcon(notification.type)}
                              </div>
                              <h4>{notification.title}</h4>
                              <span className="type-badge">{notification.type}</span>
                            </div>
                            <div className="card-actions">
                              <button 
                                className="delete-btn" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteItem(notification.id, 'notification');
                                }}
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                          
                          <div className="card-description">
                            <p>{notification.message}</p>
                          </div>
                          
                          <div className="card-meta">
                            <div className="meta-item">
                              <FiClock />
                              <span>{new Date(notification.scheduledTime).toLocaleString()}</span>
                            </div>
                            <div className="meta-item">
                              <span className="method-badge">{notification.method}</span>
                            </div>
                            <div className="meta-item">
                              <span className={`read-badge ${notification.read ? 'read' : 'unread'}`}>
                                {notification.read ? 'Read' : 'Unread'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="card-footer">
                            <span className="status-badge">{notification.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
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
        <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Notification</h3>
              <button onClick={() => setShowNotificationModal(false)} className="close-btn">
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
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
                <div className="form-group full-width">
                  <label>Message *</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Enter notification message"
                  />
                </div>
                <div className="form-group">
                  <label>Scheduled Time</label>
                  <input
                    type="datetime-local"
                    value={newNotification.scheduledTime}
                    onChange={(e) => setNewNotification({ ...newNotification, scheduledTime: e.target.value })}
                  />
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
