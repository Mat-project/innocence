import apiClient from './api/axios';

// Dashboard services
const dashboardService = {
  // Get dashboard stats (tasks due today, projects, etc.)
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent activities
  getRecentActivities: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/activities/recent/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  // Get task analytics for charts
  getTaskAnalytics: async (timeRange = '7') => {
    try {
      const response = await apiClient.get(`/api/dashboard/tasks/analytics/?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task analytics:', error);
      throw error;
    }
  },

  // Get pomodoro stats
  getPomodoroStats: async (timeRange = '7') => {
    try {
      const response = await apiClient.get(`/api/dashboard/pomodoro/stats/?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pomodoro stats:', error);
      throw error;
    }
  },

  // Get habit stats
  getHabitStats: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/habits/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching habit stats:', error);
      throw error;
    }
  },

  // Get feature usage stats
  getUsageStats: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/usage/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      throw error;
    }
  },

  // Get personalized insights
  getInsights: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/insights/');
      return response.data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  },

  // Track feature usage
  trackFeatureUsage: async (feature) => {
    try {
      await apiClient.post('/api/dashboard/track-usage/', { feature });
    } catch (error) {
      console.error('Error tracking feature usage:', error);
      // Don't throw error for tracking to avoid disrupting user experience
    }
  },
};

export default dashboardService;
