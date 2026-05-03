import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyFirebase: (data) => api.post('/auth/verify-firebase', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const equipmentAPI = {
  getAll: () => api.get('/equipment'),
  getHistory: (studentId) => api.get(`/equipment/history/${encodeURIComponent(studentId)}`),
  getRequests: () => api.get('/equipment/requests'),
  request: (body) => api.post('/equipment/request', body),
  cancelRequest: (requestId) => api.delete(`/equipment/request/${requestId}`),
  initiateReturn: (requestId) => api.patch(`/equipment/request/${requestId}`),
  approveReturn: (requestId) => api.patch(`/equipment/request/${requestId}/return-approved`),
  acceptRequest: (requestId) => api.patch(`/equipment/request/${requestId}/accept`),
  declineRequest: (requestId) => api.patch(`/equipment/request/${requestId}/decline`),
};

export default api;
