import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com' 
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Handle responses and token expiration
api.interceptors.response.use(
  (response) => {
    return response.data;
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

export const authService = {
  login: (email, password) => 
    api.post('/api/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/api/auth/register', userData),
  
  logout: () => 
    api.post('/api/auth/logout'),
  
  refreshToken: (refreshToken) => 
    api.post('/api/auth/refresh', { refreshToken }),
  
  getProfile: () => 
    api.get('/api/users/profile')
};

export const appointmentService = {
  getAppointments: (params = {}) => 
    api.get('/api/appointments', { params }),
    
  getUserAppointments: (params = {}) => 
    api.get('/api/appointments', { params }),
  
  createAppointment: (appointmentData) => 
    api.post('/api/appointments', appointmentData),
  
  updateAppointment: (id, updateData) => 
    api.put(`/api/appointments/${id}`, updateData),
  
  cancelAppointment: (id, reason) => 
    api.patch(`/api/appointments/${id}/cancel`, { reason }),
  
  getAppointmentById: (id) => 
    api.get(`/api/appointments/${id}`),
  
  getAppointmentStats: () => 
    api.get('/api/appointments/stats')
};

export const providerService = {
  getAllProviders: (params = {}) => 
    api.get('/api/providers', { params }),
  
  getProviderById: (id) => 
    api.get(`/api/providers/${id}`),
  
  getProviderServices: (id, params = {}) => 
    api.get(`/api/providers/${id}/services`, { params }),
  
  getProviderAvailability: (id) => 
    api.get(`/api/providers/${id}/availability`)
};

export const serviceService = {
  getAllServices: (params = {}) => 
    api.get('/api/services', { params }),
  
  getServiceById: (id) => 
    api.get(`/api/services/${id}`),
  
  getServiceTimeSlots: (id, params = {}) => 
    api.get(`/api/services/${id}/slots`, { params }),
  
  searchServices: (query, params = {}) => 
    api.get('/api/services/search', { params: { q: query, ...params } }),
  
  getPopularServices: (params = {}) => 
    api.get('/api/services/popular', { params }),
  
  getServiceCategories: () => 
    api.get('/api/services/categories')
};

export default api;