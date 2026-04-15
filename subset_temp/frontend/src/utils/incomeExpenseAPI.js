import api from './api';

export const incomeExpenseAPI = {
  // Get all income/expense records with filtering and pagination
  getRecords: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/income-expense?${queryParams.toString()}`);
  },

  // Get single record by ID
  getRecord: (id) => api.get(`/income-expense/${id}`),

  // Create new record
  createRecord: (recordData) => api.post('/income-expense', recordData),

  // Update existing record
  updateRecord: (id, recordData) => api.put(`/income-expense/${id}`, recordData),

  // Delete record (soft delete)
  deleteRecord: (id) => api.delete(`/income-expense/${id}`),

  // Get summary statistics
  getSummary: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/income-expense/summary/stats?${queryParams.toString()}`);
  },

  // Get recurring records
  getRecurringRecords: () => api.get('/income-expense/recurring/list'),

  // Get records by tags
  getRecordsByTag: (tag) => api.get(`/income-expense/tags/${tag}`),
};

export default incomeExpenseAPI;
