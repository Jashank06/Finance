import api from './api';

const notificationsAPI = {
  // Get all notifications
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/notifications?${queryParams}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Create new notification
  create: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  // Update notification
  update: async (id, notificationData) => {
    const response = await api.put(`/notifications/${id}`, notificationData);
    return response.data;
  },

  // Delete notification
  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Mark as read
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Get analytics
  getAnalytics: async (year) => {
    const params = year ? `?year=${year}` : '';
    const response = await api.get(`/notifications/analytics${params}`);
    return response.data;
  }
};

export default notificationsAPI;
