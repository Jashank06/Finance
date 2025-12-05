import api from './api';

const remindersAPI = {
  // Get all reminders
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/reminders?${queryParams}`);
    return response.data;
  },

  // Get upcoming reminders
  getUpcoming: async (days = 30, category = 'all') => {
    const params = `?days=${days}${category !== 'all' ? `&category=${category}` : ''}`;
    const response = await api.get(`/reminders/upcoming${params}`);
    return response.data;
  },

  // Create new reminder
  create: async (reminderData) => {
    const response = await api.post('/reminders', reminderData);
    return response.data;
  },

  // Update reminder
  update: async (id, reminderData) => {
    const response = await api.put(`/reminders/${id}`, reminderData);
    return response.data;
  },

  // Delete reminder
  delete: async (id) => {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  },

  // Toggle reminder status
  toggleStatus: async (id) => {
    const response = await api.patch(`/reminders/${id}/toggle-status`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (year) => {
    const params = year ? `?year=${year}` : '';
    const response = await api.get(`/reminders/analytics${params}`);
    return response.data;
  }
};

export default remindersAPI;
