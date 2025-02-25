import api from './axios';

export const authAPI = {
  login: (data) => api.post('/api/auth/login/', data),
  register: (data) => api.post('/api/auth/register/', data),
  logout: () => api.post('/api/auth/logout/'),
  getProfile: () => api.get('/api/auth/profile/'),
  forgotPassword: (data) => api.post('/api/auth/forgot-password/', data),
};

export const taskAPI = {
  getTasks: () => api.get('/api/tasks/'),
  createTask: (data) => api.post('/api/tasks/', data),
  updateTask: (id, data) => api.put(`/api/tasks/${id}/`, data),
  deleteTask: (id) => api.delete(`/api/tasks/${id}/`),
};