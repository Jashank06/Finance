import api from './api';

export const staticAPI = {
  // Basic Details
  getBasicDetails: () => api.get('/static/basic-details'),
  
  createBasicDetails: (data) => api.post('/static/basic-details', data),
  
  updateBasicDetails: (id, data) => api.put(`/static/basic-details/${id}`, data),
  
  deleteBasicDetails: (id) => api.delete(`/static/basic-details/${id}`),
  
  // Company Records
  getCompanyRecords: () => api.get('/static/company-records'),
  
  createCompanyRecord: (data) => api.post('/static/company-records', data),
  
  updateCompanyRecord: (id, data) => api.put(`/static/company-records/${id}`, data),
  
  deleteCompanyRecord: (id) => api.delete(`/static/company-records/${id}`),
  
  // Customer Support
  getCustomerSupport: () => api.get('/static/customer-support'),
  createCustomerSupport: (data) => api.post('/static/customer-support', data),
  updateCustomerSupport: (id, data) => api.put(`/static/customer-support/${id}`, data),
  deleteCustomerSupport: (id) => api.delete(`/static/customer-support/${id}`),
  
  // Family Profile
  getFamilyProfile: () => api.get('/static/family-profile'),
  
  createFamilyProfile: (data) => api.post('/static/family-profile', data),
  
  updateFamilyProfile: (id, data) => api.put(`/static/family-profile/${id}`, data),
  
  deleteFamilyProfile: (id) => api.delete(`/static/family-profile/${id}`),
  
  // Land Records
  getLandRecords: () => api.get('/static/land-records'),
  createLandRecord: (data) => api.post('/static/land-records', data),
  updateLandRecord: (id, data) => api.put(`/static/land-records/${id}`, data),
  deleteLandRecord: (id) => api.delete(`/static/land-records/${id}`),
  
  // Membership List
  getMembershipList: () => api.get('/static/membership-list'),
  
  createMembership: (data) => api.post('/static/membership-list', data),
  
  updateMembership: (id, data) => api.put(`/static/membership-list/${id}`, data),
  
  deleteMembership: (id) => api.delete(`/static/membership-list/${id}`),
  
  // Online Access Details
  getOnlineAccessDetails: () => api.get('/static/online-access-details'),
  
  createOnlineAccessDetails: (data) => api.post('/static/online-access-details', data),
  
  updateOnlineAccessDetails: (id, data) => api.put(`/static/online-access-details/${id}`, data),
  
  deleteOnlineAccessDetails: (id) => api.delete(`/static/online-access-details/${id}`),
  
  // Mobile & Email Details
  getMobileEmailDetails: () => api.get('/static/mobile-email-details'),
  
  createMobileEmailDetails: (data) => api.post('/static/mobile-email-details', data),
  
  updateMobileEmailDetails: (id, data) => api.put(`/static/mobile-email-details/${id}`, data),
  
  deleteMobileEmailDetails: (id) => api.delete(`/static/mobile-email-details/${id}`),
  
  // Personal Records
  getPersonalRecords: () => api.get('/static/personal-records'),
  
  createPersonalRecord: (data) => api.post('/static/personal-records', data),
  
  updatePersonalRecord: (id, data) => api.put(`/static/personal-records/${id}`, data),
  
  deletePersonalRecord: (id) => api.delete(`/static/personal-records/${id}`),
  
  // Digital Assets
  getDigitalAssets: () => api.get('/static/digital-assets'),
  
  createDigitalAsset: (data) => api.post('/static/digital-assets', data),
  
  updateDigitalAsset: (id, data) => api.put(`/static/digital-assets/${id}`, data),
  
  deleteDigitalAsset: (id) => api.delete(`/static/digital-assets/${id}`),
  
  // Family Profile
  getFamilyProfile: () => api.get('/static/family-profile'),
  
  createFamilyProfile: (data) => api.post('/static/family-profile', data),
  
  updateFamilyProfile: (id, data) => api.put(`/static/family-profile/${id}`, data),
  
  deleteFamilyProfile: (id) => api.delete(`/static/family-profile/${id}`),
  
  // Inventory Record
  getInventoryRecord: () => api.get('/static/inventory-record'),
  
  createInventoryRecord: (data) => api.post('/static/inventory-record', data),
  
  updateInventoryRecord: (id, data) => api.put(`/static/inventory-record/${id}`, data),
  
  deleteInventoryRecord: (id) => api.delete(`/static/inventory-record/${id}`),
  
  // Contact Management
  getContactManagement: () => api.get('/static/contact-management'),
  
  createContactManagement: (data) => api.post('/static/contact-management', data),
  
  updateContactManagement: (id, data) => api.put(`/static/contact-management/${id}`, data),
  
  deleteContactManagement: (id) => api.delete(`/static/contact-management/${id}`),
  
  // Get all static data for a user
  getAllStatic: () => api.get('/static'),
// Family Tasks
  getFamilyTasks: () => api.get('/static/family-tasks'),
  
  createFamilyTask: (data) => api.post('/static/family-tasks', data),
  
  updateFamilyTask: (id, data) => api.put(`/static/family-tasks/${id}`, data),
  
  deleteFamilyTask: (id) => api.delete(`/static/family-tasks/${id}`),

  // Generic methods for backward compatibility
  getAll: (category) => api.get(`/static/${category}`),
  create: (category, data) => api.post(`/static/${category}`, data),
  update: (id, data) => api.put(`/static/family-tasks/${id}`, data),
  delete: (id) => api.delete(`/static/family-tasks/${id}`),
};
