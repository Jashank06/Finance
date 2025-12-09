import api from '../utils/api';

const calendarTypesAPI = {
  // Get all calendar types
  getAll: async () => {
    const response = await api.get('/calendar-types');
    return response.data;
  },

  // Create new calendar type
  create: async (calendarTypeData) => {
    const response = await api.post('/calendar-types', calendarTypeData);
    return response.data;
  },

  // Update calendar type
  update: async (id, calendarTypeData) => {
    const response = await api.put(`/calendar-types/${id}`, calendarTypeData);
    return response.data;
  },

  // Delete calendar type
  delete: async (id) => {
    const response = await api.delete(`/calendar-types/${id}`);
    return response.data;
  }
};

export default calendarTypesAPI;
