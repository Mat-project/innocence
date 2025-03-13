import api from './axios';

export const authAPI = {
  login: (data) => api.post('/api/auth/login/', data),
  register: (data) => api.post('/api/auth/register/', data),
  logout: () => api.post('/api/auth/logout/'),
  getProfile: () => api.get('/api/auth/profile/'),
  updateProfile: (data) => {
    // If data is FormData, let browser set content type; otherwise, JSON.
    const isFormData = data instanceof FormData;
    const headers = isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };
    return api.patch('/api/auth/profile/', data, { headers });
  },
  forgotPassword: (data) => api.post('/api/auth/forgot-password/', data),
};

export const taskAPI = {
  getTasks: () => api.get('/api/tasks/'),
  createTask: (data) => api.post('/api/tasks/', data),
  updateTask: (id, data) => api.patch(`/api/tasks/${id}/`, data),
  deleteTask: (id) => api.delete(`/api/tasks/${id}/`),
};

export const notificationAPI = {
  getNotifications: async () => {
    return await api.get('/notifications/');
  },
  
  markAsRead: async (id) => {
    return await api.patch(`/notifications/${id}/read/`);
  },
  
  createNotification: async (data) => {
    return await api.post('/notifications/', data);
  },
  
  deleteNotification: async (id) => {
    return await api.delete(`/notifications/${id}/`);
  }
};
export const fileConverterAPI = {
  convertFile: (formData) => 
    api.post('/api/convert/', formData,{ headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'blob' }),
};