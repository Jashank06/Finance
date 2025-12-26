import api from './api';

const reminderAPI = {
    // Get all reminders
    getAll: () => api.get('/reminders'),

    // Get single reminder
    getOne: (id) => api.get(`/reminders/${id}`),

    // Create new reminder
    create: (data) => api.post('/reminders', data),

    // Update reminder
    update: (id, data) => api.put(`/reminders/${id}`, data),

    // Delete reminder
    delete: (id) => api.delete(`/reminders/${id}`),

    // Get analytics
    getAnalytics: () => api.get('/reminders/analytics/summary'),

    // Get upcoming
    getUpcoming: (days = 7) => api.get(`/reminders/upcoming?days=${days}`)
};

export default reminderAPI;
