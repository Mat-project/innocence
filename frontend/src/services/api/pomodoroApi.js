import api from '../axios';

/**
 * Service for Pomodoro API interactions
 */

// Save a completed Pomodoro session
export const savePomodoroSession = async (sessionData) => {
  try {
    console.log('[Pomodoro] Saving session:', sessionData);
    const response = await api.post('/api/pomodoro/sessions/', sessionData);
    console.log('[Pomodoro] Session saved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Pomodoro] Error saving session:', error);
    throw error;
  }
};

// Get all Pomodoro sessions for the current user
export const getPomodoroSessions = async () => {
  try {
    console.log('[Pomodoro] Fetching sessions');
    const response = await api.get('/api/pomodoro/sessions/');
    console.log('[Pomodoro] Sessions fetched:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('[Pomodoro] Error fetching sessions:', error);
    return [];
  }
};

// Get statistics about Pomodoro usage
export const getPomodoroStatistics = async () => {
  try {
    console.log('[Pomodoro] Fetching statistics');
    const response = await api.get('/api/pomodoro/sessions/statistics/');
    console.log('[Pomodoro] Statistics fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Pomodoro] Error fetching statistics:', error);
    return {
      total_sessions: 0,
      total_focus_time: 0,
      completed_sessions: 0,
      completion_rate: 0,
      by_day_of_week: []
    };
  }
};