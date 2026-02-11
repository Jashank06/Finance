import api from './api';

export const investmentAPI = {
  getAll: (category) => {
    const params = category ? `?category=${category}` : '';
    return api.get(`/investments${params}`);
  },

  getOne: (id) => api.get(`/investments/${id}`),

  getById: (id) => api.get(`/investments/${id}`),

  create: (data) => api.post('/investments', data),

  update: (id, data) => api.put(`/investments/${id}`, data),

  delete: (id) => api.delete(`/investments/${id}`),

  // Wallet methods
  getWallets: () => api.get('/cash?type=digital-wallet'),
  createWallet: (data) => api.post('/cash', data),
  deleteWallet: (id) => api.delete(`/cash/${id}`),

  getStats: () => api.get('/investments/stats/summary'),

  // Loan-specific methods
  getLoans: () => api.get('/investments/loans/list'),

  updatePaymentStatus: (loanId, paymentNumber, data) =>
    api.patch(`/investments/${loanId}/payment/${paymentNumber}`, data),
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

  // Category dropdown data endpoints
  getLoanPersons: () => api.get('/investments/loan-ledger/persons'),
  getOnBehalfPersons: () => api.get('/investments/on-behalf/persons'),

  // Record payment from bank transaction to loan
  recordLoanPayment: ({ loanId, amount, paymentDate, bankTransactionId, source }) =>
    api.post(`/investments/loans/${loanId}/record-payment`, {
      amount,
      paymentDate,
      bankTransactionId,
      source
    }),

  // Record transaction from bank to udhar ledger
  recordUdharTransaction: (data) =>
    api.post('/investments/loan-ledger/sync-transaction', data),

  // Record transaction from bank to on-behalf module
  recordOnBehalfTransaction: (data) =>
    api.post('/investments/on-behalf/sync-transaction', data),
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
