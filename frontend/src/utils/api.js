import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://finance-qr54.onrender.com/api'
  : '/api';

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

export default api;
