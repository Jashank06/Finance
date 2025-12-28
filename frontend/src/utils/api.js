import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    const userData = response.data.user;

    // Fetch subscription plan details if exists
    if (userData.subscriptionPlan) {
      try {
        const planResponse = await api.get(`/subscription-plans/${userData.subscriptionPlan}`);
        userData.subscriptionPlan = planResponse.data;
      } catch (err) {
        console.error('Error fetching subscription plan:', err);
      }
    }

    return { ...response, data: { user: userData } };
  },
};

// Folder API
export const folderAPI = {
  getFolders: () => api.get('/folders'),
  getFolderTree: () => api.get('/folders/tree'),
  getFolder: (id) => api.get(`/folders/${id}`),
  createFolder: (data) => api.post('/folders', data),
  renameFolder: (id, name) => api.put(`/folders/${id}`, { name }),
  deleteFolder: (id) => api.delete(`/folders/${id}`),
  moveFolder: (id, newParentId) => api.post(`/folders/${id}/move`, { newParentId }),
  seedDefaultFolders: () => api.post('/folders/seed/default'),
};

// Document API
export const documentAPI = {
  getDocuments: () => api.get('/documents'),
  getDocumentsByFolder: (folderId) => api.get(`/documents/folder/${folderId}`),
  getDocument: (id) => api.get(`/documents/${id}`),
  uploadDocuments: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadDocument: (id) => api.get(`/documents/${id}/download`, {
    responseType: 'blob'
  }),
  getPreview: (id) => api.get(`/documents/${id}/preview`, {
    responseType: 'blob'
  }),
  getPreviewUrl: (id) => `${API_BASE_URL}/documents/${id}/preview`,
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  moveDocument: (id, newFolderId) => api.post(`/documents/${id}/move`, { newFolderId }),
  copyDocument: (id, targetFolderId) => api.post(`/documents/${id}/copy`, { targetFolderId }),
  searchDocuments: (params) => api.get('/documents/search/query', { params }),
};

export default api;
