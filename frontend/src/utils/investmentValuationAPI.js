import api from './api';

export const investmentValuationAPI = {
  // Summary
  getSummary: () => api.get('/investment-valuation/summary'),

  // Mutual Funds
  getMutualFunds: (type = null) => {
    const params = type ? `?type=${type}` : '';
    return api.get(`/investment-valuation/mutual-funds${params}`);
  },
  createMutualFund: (data) => api.post('/investment-valuation/mutual-funds', data),
  updateMutualFund: (id, data) => api.put(`/investment-valuation/mutual-funds/${id}`, data),
  deleteMutualFund: (id) => api.delete(`/investment-valuation/mutual-funds/${id}`),

  // Shares
  getShares: () => api.get('/investment-valuation/shares'),
  createShare: (data) => api.post('/investment-valuation/shares', data),
  updateShare: (id, data) => api.put(`/investment-valuation/shares/${id}`, data),
  deleteShare: (id) => api.delete(`/investment-valuation/shares/${id}`),

  // Insurance
  getInsurance: (type = null) => {
    const params = type ? `?type=${type}` : '';
    return api.get(`/investment-valuation/insurance${params}`);
  },
  createInsurance: (data) => api.post('/investment-valuation/insurance', data),
  updateInsurance: (id, data) => api.put(`/investment-valuation/insurance/${id}`, data),
  deleteInsurance: (id) => api.delete(`/investment-valuation/insurance/${id}`),

  // Loans
  getLoans: () => api.get('/investment-valuation/loans'),
  createLoan: (data) => api.post('/investment-valuation/loans', data),
  updateLoan: (id, data) => api.put(`/investment-valuation/loans/${id}`, data),
  deleteLoan: (id) => api.delete(`/investment-valuation/loans/${id}`),

  // SIP Transactions
  getSIPTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/investment-valuation/sip-transactions${query ? `?${query}` : ''}`);
  },
  generateSIPTransactions: (mutualFundId) =>
    api.post(`/investment-valuation/sip-transactions/generate/${mutualFundId}`),
  addSIPTransaction: (data) => api.post('/investment-valuation/sip-transactions', data),
  updateSIPTransaction: (id, data) => api.put(`/investment-valuation/sip-transactions/${id}`, data),
  deleteSIPTransaction: (id) => api.delete(`/investment-valuation/sip-transactions/${id}`),

  // NAV Refresh
  refreshMFNav: (id) => api.post(`/investment-valuation/mutual-funds/refresh-nav/${id}`),
};