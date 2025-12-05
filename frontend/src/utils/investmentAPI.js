import api from './api';

export const investmentAPI = {
  getAll: (category) => {
    const params = category ? `?category=${category}` : '';
    return api.get(`/investments${params}`);
  },
  
  getOne: (id) => api.get(`/investments/${id}`),
  
  create: (data) => api.post('/investments', data),
  
  update: (id, data) => api.put(`/investments/${id}`, data),
  
  delete: (id) => api.delete(`/investments/${id}`),
  
  getStats: () => api.get('/investments/stats/summary'),
};

// Gold/SGB specific API endpoints
export const goldSgbAPI = {
  // Get current market prices
  getPrices: () => api.get('/gold-sgb/prices'),
  
  // Get comprehensive analytics
  getAnalytics: () => api.get('/gold-sgb/analytics'),
  
  // Update market prices for investments
  updatePrices: () => api.put('/gold-sgb/update-prices'),
  
  // Get maturity alerts for SGBs
  getMaturityAlerts: () => api.get('/gold-sgb/maturity-alerts'),
  
  // Get portfolio health score
  getPortfolioHealth: () => api.get('/gold-sgb/portfolio-health'),
};
