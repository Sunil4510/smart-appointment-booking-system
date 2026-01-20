import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common error responses
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
      
      if (status === 403) {
        return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
      }
      
      if (status >= 400 && status < 500) {
        // Client errors
        return Promise.reject(new Error(data.message || 'Bad request'));
      }
      
      if (status >= 500) {
        // Server errors
        return Promise.reject(new Error('Server error. Please try again later.'));
      }
      
      // Other error responses
      return Promise.reject(new Error(data.message || 'An error occurred'));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
    }
  }
);

// API service methods
const apiService = {
  // Generic HTTP methods
  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      throw error;
    }
  },

  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  patch: async (url, data = {}, config = {}) => {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      throw error;
    }
  },

  // Specific API endpoints
  
  // Auth endpoints
  auth: {
    login: (credentials) => apiService.post('/api/auth/login', credentials),
    register: (userData) => apiService.post('/api/auth/register', userData),
    refresh: () => apiService.post('/api/auth/refresh'),
    logout: () => apiService.post('/api/auth/logout'),
  },

  // User endpoints
  users: {
    getProfile: () => apiService.get('/api/users/profile'),
    updateProfile: (data) => apiService.put('/api/users/profile', data),
    deleteAccount: () => apiService.delete('/api/users/profile'),
  },

  // Provider endpoints
  providers: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiService.get(`/api/providers${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => apiService.get(`/api/providers/${id}`),
    create: (data) => apiService.post('/api/providers', data),
    update: (id, data) => apiService.put(`/api/providers/${id}`, data),
    delete: (id) => apiService.delete(`/api/providers/${id}`),
    getSlots: (id, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiService.get(`/api/providers/${id}/slots${queryString ? `?${queryString}` : ''}`);
    },
  },

  // Service endpoints
  services: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiService.get(`/api/services${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => apiService.get(`/api/services/${id}`),
    create: (data) => apiService.post('/api/services', data),
    update: (id, data) => apiService.put(`/api/services/${id}`, data),
    delete: (id) => apiService.delete(`/api/services/${id}`),
    getSlots: (id, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiService.get(`/api/services/${id}/slots${queryString ? `?${queryString}` : ''}`);
    },
  },

  // Appointment endpoints
  appointments: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiService.get(`/api/appointments${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => apiService.get(`/api/appointments/${id}`),
    create: (data) => apiService.post('/api/appointments', data),
    update: (id, data) => apiService.put(`/api/appointments/${id}`, data),
    cancel: (id, reason) => apiService.patch(`/api/appointments/${id}/cancel`, { reason }),
    delete: (id) => apiService.delete(`/api/appointments/${id}`),
    getStats: () => apiService.get('/api/appointments/stats'),
  },

  // Time slot endpoints
  timeSlots: {
    getForService: (serviceId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiService.get(`/api/services/${serviceId}/slots${queryString ? `?${queryString}` : ''}`);
    },
    getForProvider: (providerId, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return apiService.get(`/api/providers/${providerId}/slots${queryString ? `?${queryString}` : ''}`);
    },
    create: (providerId, data) => apiService.post(`/api/providers/${providerId}/slots`, data),
  },
};

export default apiService;