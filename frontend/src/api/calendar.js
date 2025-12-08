import api from './api';

const calendarAPI = {
  // Get all events
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/calendar?${queryParams}`);
    return response.data;
  },

  // Get events for specific month
  getMonthEvents: async (year, month, calendar = 'all') => {
    const params = calendar !== 'all' ? `?calendar=${calendar}` : '';
    const response = await api.get(`/calendar/month/${year}/${month}${params}`);
    return response.data;
  },

  // Get events for entire year
  getYearEvents: async (year, filters = {}) => {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...filters
    });
    const response = await api.get(`/calendar?${params}`);
    return response.data;
  },

  // Get upcoming events
  getUpcoming: async (days = 30, calendar = 'all') => {
    const params = `?days=${days}${calendar !== 'all' ? `&calendar=${calendar}` : ''}`;
    const response = await api.get(`/calendar/upcoming${params}`);
    return response.data;
  },

  // Create new event
  create: async (eventData) => {
    const response = await api.post('/calendar', eventData);
    return response.data;
  },

  // Update event
  update: async (id, eventData) => {
    const response = await api.put(`/calendar/${id}`, eventData);
    return response.data;
  },

  // Delete event
  delete: async (id) => {
    const response = await api.delete(`/calendar/${id}`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (year) => {
    const params = year ? `?year=${year}` : '';
    const response = await api.get(`/calendar/analytics${params}`);
    return response.data;
  },

  // Bulk operations
  bulkCreate: async (events) => {
    const response = await api.post('/calendar/bulk', {
      operation: 'create',
      events
    });
    return response.data;
  },

  bulkDelete: async (eventIds) => {
    const response = await api.post('/calendar/bulk', {
      operation: 'delete',
      events: eventIds
    });
    return response.data;
  }
};

export default calendarAPI;
