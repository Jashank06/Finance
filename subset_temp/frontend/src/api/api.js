import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and section context
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Automatically append section and businessId based on current route
    if (typeof window !== 'undefined') {
      const isBusiness = window.location.pathname.startsWith('/business') || window.location.pathname === '/company-profile';
      const section = isBusiness ? 'business' : 'family';
      
      // Add to query params
      config.params = { ...config.params, section };
      
      // Add to body for POST/PUT/PATCH if it's a JSON request
      if (['post', 'put', 'patch'].includes(config.method?.toLowerCase()) && 
          config.data && typeof config.data === 'object' && 
          !(config.data instanceof FormData)) {
        config.data.section = section;
      }
      
      if (isBusiness) {
        const businessId = localStorage.getItem('selectedBusinessId');
        if (businessId && businessId !== 'all') {
          config.params.businessId = businessId;
          
          if (['post', 'put', 'patch'].includes(config.method?.toLowerCase()) && 
              config.data && typeof config.data === 'object' && 
              !(config.data instanceof FormData)) {
            config.data.businessId = businessId;
          }
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
