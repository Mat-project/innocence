import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Pomodoro API functions
export const savePomodoroSession = async (sessionData) => {
  try {
    const response = await apiClient.post('/pomodoro/sessions/', sessionData);
    return response.data;
  } catch (error) {
    console.error('Error saving pomodoro session:', error);
    throw error;
  }
};

export const getPomodoroSessions = async () => {
  try {
    const response = await apiClient.get('/pomodoro/sessions/');
    return response.data;
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error);
    throw error;
  }
};

export const getPomodoroStatistics = async () => {
  try {
    const response = await apiClient.get('/pomodoro/sessions/statistics/');
    return response.data;
  } catch (error) {
    console.error('Error fetching pomodoro statistics:', error);
    throw error;
  }
};