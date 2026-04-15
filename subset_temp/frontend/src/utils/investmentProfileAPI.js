import api from './api';

export const investmentProfileAPI = {
  // Bank Account APIs
  getBankAccounts: () => api.get('/investment-profile/bank-accounts'),
  getBankAccount: (id) => api.get(`/investment-profile/bank-accounts/${id}`),
  createBankAccount: (data) => api.post('/investment-profile/bank-accounts', data),
  updateBankAccount: (id, data) => api.put(`/investment-profile/bank-accounts/${id}`, data),
  deleteBankAccount: (id) => api.delete(`/investment-profile/bank-accounts/${id}`),

  // Card Detail APIs
  getCardDetails: () => api.get('/investment-profile/card-details'),
  getCardDetail: (id) => api.get(`/investment-profile/card-details/${id}`),
  createCardDetail: (data) => api.post('/investment-profile/card-details', data),
  updateCardDetail: (id, data) => api.put(`/investment-profile/card-details/${id}`, data),
  deleteCardDetail: (id) => api.delete(`/investment-profile/card-details/${id}`),

  // Payment Gateway APIs
  getPaymentGateways: () => api.get('/investment-profile/payment-gateways'),
  getPaymentGateway: (id) => api.get(`/investment-profile/payment-gateways/${id}`),
  createPaymentGateway: (data) => api.post('/investment-profile/payment-gateways', data),
  updatePaymentGateway: (id, data) => api.put(`/investment-profile/payment-gateways/${id}`, data),
  deletePaymentGateway: (id) => api.delete(`/investment-profile/payment-gateways/${id}`),

  // Insurance APIs
  getInsurance: () => api.get('/investment-profile/insurance'),
  getInsuranceItem: (id) => api.get(`/investment-profile/insurance/${id}`),
  createInsurance: (data) => api.post('/investment-profile/insurance', data),
  updateInsurance: (id, data) => api.put(`/investment-profile/insurance/${id}`, data),
  deleteInsurance: (id) => api.delete(`/investment-profile/insurance/${id}`),

  // Mutual Fund APIs
  getMutualFunds: () => api.get('/investment-profile/mutual-funds'),
  getMutualFund: (id) => api.get(`/investment-profile/mutual-funds/${id}`),
  createMutualFund: (data) => api.post('/investment-profile/mutual-funds', data),
  updateMutualFund: (id, data) => api.put(`/investment-profile/mutual-funds/${id}`, data),
  deleteMutualFund: (id) => api.delete(`/investment-profile/mutual-funds/${id}`),

  // Share APIs
  getShares: () => api.get('/investment-profile/shares'),
  getShare: (id) => api.get(`/investment-profile/shares/${id}`),
  createShare: (data) => api.post('/investment-profile/shares', data),
  updateShare: (id, data) => api.put(`/investment-profile/shares/${id}`, data),
  deleteShare: (id) => api.delete(`/investment-profile/shares/${id}`),

  // NpsPpf APIs
  getNpsPpf: () => api.get('/investment-profile/nps-ppf'),
  getNpsPpfItem: (id) => api.get(`/investment-profile/nps-ppf/${id}`),
  createNpsPpf: (data) => api.post('/investment-profile/nps-ppf', data),
  updateNpsPpf: (id, data) => api.put(`/investment-profile/nps-ppf/${id}`, data),
  deleteNpsPpf: (id) => api.delete(`/investment-profile/nps-ppf/${id}`),

  // GoldBond APIs
  getGoldBonds: () => api.get('/investment-profile/gold-bonds'),
  getGoldBondItem: (id) => api.get(`/investment-profile/gold-bonds/${id}`),
  createGoldBonds: (data) => api.post('/investment-profile/gold-bonds', data),
  updateGoldBonds: (id, data) => api.put(`/investment-profile/gold-bonds/${id}`, data),
  deleteGoldBonds: (id) => api.delete(`/investment-profile/gold-bonds/${id}`)
};
