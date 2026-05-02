import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on any unauthorized response and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('authStateChanged'));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyFirebase: (data) => api.post('/auth/verify-firebase', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  setPassword: (data) => api.put('/auth/profile/password', data),
};

export const equipmentAPI = {
  getAll: () => api.get('/equipment'),
  request: (data) => api.post('/equipment/request', data),
  requestEquipment: (data) => api.post('/equipment/request', data),
  cancel: (id) => api.delete(`/equipment/request/${id}`),
  cancelRequest: (id) => api.delete(`/equipment/request/${id}`),
  getHistory: (id) => api.get(`/equipment/history/${id}`),
  updateQuantity: (id, data) => api.put(`/equipment/${id}/quantity`, data),
};

export const manageAPI = {
  getAll: (search) => api.get(`/manage?search=${search || ''}`),
  getById: (id) => api.get(`/manage/${id}`),
  add: (data) => api.post('/manage', data),
  update: (id, data) => api.put(`/manage/${id}`, data),
  delete: (id) => api.delete(`/manage/${id}`),
  addStock: (id, quantity) => api.patch(`/manage/${id}/add-stock`, { quantity }),
  removeStock: (id, quantity) => api.patch(`/manage/${id}/remove-stock`, { quantity }),
  getSports: () => api.get('/manage/sports/list'),
  addSport: (name) => api.post('/manage/sports/add', { name }),
};

export const adminAPI = {
  getRequests: (regNumber) => api.get(`/admin/requests/${regNumber}`),
  getAllEquipment: () => api.get('/admin/list'),
  acceptRequest: (id) => api.post(`/admin/accept/${id}`),
  declineRequest: (id) => api.post(`/admin/decline/${id}`),
  returnEquipment: (id) => api.post(`/admin/return/${id}`),
  getPendingReturns: (regNumber) => api.get(`/admin/pending-return/${regNumber}`),
  getHistory: (regNumber) => api.get(`/admin/history/${regNumber}`),
};

export default api;