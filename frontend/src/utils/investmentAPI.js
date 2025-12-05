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
  getBillDatesAnalytics: (params = {}) => {
    const year = params.year ? `year=${params.year}` : '';
    const horizon = params.horizonDays ? `horizonDays=${params.horizonDays}` : '';
    const qs = [year, horizon].filter(Boolean).join('&');
    const suffix = qs ? `?${qs}` : '';
    return api.get(`/investments/bill-dates/analytics${suffix}`);
  },
  getWeeklyAppointments: (params = {}) => {
    const weekStart = params.weekStart ? `weekStart=${params.weekStart}` : '';
    const qs = [weekStart].filter(Boolean).join('&');
    const suffix = qs ? `?${qs}` : '';
    return api.get(`/investments/appointments/weekly${suffix}`);
  },
  getYearlyCalendar: (params = {}) => {
    const year = params.year ? `year=${params.year}` : '';
    const categories = params.categories && params.categories.length ? `categories=${params.categories.join(',')}` : '';
    const qs = [year, categories].filter(Boolean).join('&');
    const suffix = qs ? `?${qs}` : '';
    return api.get(`/investments/calendar/yearly${suffix}`);
  },
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
