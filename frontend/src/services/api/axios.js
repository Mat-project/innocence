import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Improved response interceptor - use async/await pattern consistently
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt token refresh once to avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Check if refresh token exists
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
          refresh: refreshToken,
        });

        if (response.data && response.data.access) {
          const { access } = response.data;
          
          // Save the new token
          localStorage.setItem('accessToken', access);
          
          // Update authorization header and retry
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear all auth tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Add small delay to allow error handling before redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
