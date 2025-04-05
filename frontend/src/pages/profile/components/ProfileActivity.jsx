import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, Briefcase, Flame, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { taskAPI } from "../../../service/api";
import axios from "../../../service/axios";

export default function ProfileActivity() {
  const [metrics, setMetrics] = useState({
    taskCompletionRate: 0,
    totalTasks: 0,
    projectsCount: 0,
    pomodoroTime: 0,
    streak: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all the data we need for the profile activity section
  useEffect(() => {
    const fetchProfileActivityData = async () => {
      setLoading(true);
      try {
        // Helper function to fetch with fallback
        const safeGet = async (url, defaultValue = null) => {
          try {
            const response = await axios.get(url);
            console.log(`Data from ${url}:`, response.data);
            return response.data;
          } catch (err) {
            console.warn(`Failed to fetch ${url}:`, err);
            return defaultValue;
          }
        };

        // Create an array of promises for parallel fetching
        const [tasksResponse, pomodoroData] = await Promise.all([
          taskAPI.getTasks().catch(() => ({ data: [] })),
          safeGet('/api/pomodoro/sessions/statistics/', { 
            total_focus_time: 0, 
            completed_sessions: 0,
            recent_sessions: []
          })
        ]);
        
        // Process tasks data
        const tasks = tasksResponse.data || [];
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const projectTasks = tasks.filter(task => task.category?.toLowerCase().includes('project')).length;
        
        const taskCompletionRate = tasks.length > 0 
          ? Math.round((completedTasks / tasks.length) * 100) 
          : 0;
        
        // Extract pomodoro focus time (convert minutes to hours)
        console.log("Pomodoro data:", pomodoroData);
        
        // Ensure we have valid numeric data for calculations
        const totalFocusTime = pomodoroData && typeof pomodoroData.total_focus_time === 'number' 
          ? pomodoroData.total_focus_time 
          : 0;
        
        // Parse as integer and calculate hours, ensuring we don't get NaN
        const pomodoroMinutes = parseInt(totalFocusTime, 10) || 0;
        // Only convert to hours if minutes > 0, otherwise use 0
        const pomodoroHours = pomodoroMinutes > 0 ? Math.max(1, Math.round(pomodoroMinutes / 60)) : 0;
        
        console.log("Parsed pomodoro minutes:", pomodoroMinutes);
        console.log("Calculated pomodoro hours:", pomodoroHours);
        
        // Calculate login streak
        const streak = calculateStreak();
        
        // Set metrics with real data and ensure they're all valid numbers
        setMetrics({
          taskCompletionRate: isNaN(taskCompletionRate) ? 0 : taskCompletionRate,
          totalTasks: tasks.length || 0,
          projectsCount: projectTasks || 0,
          pomodoroTime: pomodoroHours, // This should now always be a valid number
          streak: streak
        });
        
        // Generate recent activities from completed tasks and pomodoro sessions
        const recentActivities = [];
        
        // Add recent completed tasks
        const recentCompletedTasks = tasks
          .filter(task => task.status === 'completed')
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 3);
          
        recentCompletedTasks.forEach(task => {
          recentActivities.push({
            id: `task-${task.id}`,
            description: `Completed task: ${task.title}`,
            date: new Date(task.updated_at).toLocaleDateString(),
            type: 'task'
          });
        });
        
        // Add recent pomodoro sessions if available
        if (pomodoroData?.recent_sessions && Array.isArray(pomodoroData.recent_sessions)) {
          pomodoroData.recent_sessions.forEach(session => {
            if (session && session.focus_time) {
              recentActivities.push({
                id: `pomodoro-${session.id || Math.random().toString(36).substring(7)}`,
                description: `Completed ${session.focus_time} mins focus session`,
                date: new Date(session.date).toLocaleDateString(),
                type: 'pomodoro'
              });
            }
          });
        }
        
        // Add today's login if applicable
        const today = new Date().toLocaleDateString();
        if (!recentActivities.some(activity => activity.date === today)) {
          recentActivities.push({
            id: `login-${Date.now()}`,
            description: "Logged in today",
            date: today,
            type: 'login'
          });
        }
        
        // Sort by date (newest first) and limit to 5 activities
        const sortedActivities = recentActivities
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
          
        setActivities(sortedActivities);
        setError(null);
        
        // Record today's login for streak calculation
        recordLogin();
        
      } catch (err) {
        console.error("Error fetching profile activity data:", err);
        setError("Failed to load activity data");
        
        // Set some default/fallback metrics
        setMetrics({
          taskCompletionRate: 75,
          totalTasks: 12,
          projectsCount: 3,
          pomodoroTime: 0,
          streak: calculateStreak() // Still calculate streak from local storage
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileActivityData();
  }, []);

  // Calculate current streak based on local storage data
  const calculateStreak = () => {
    try {
      // Get login history from local storage
      const loginHistory = JSON.parse(localStorage.getItem('loginHistory')) || [];
      if (loginHistory.length === 0) return 1; // First login starts streak at 1
      
      // Sort dates in ascending order
      loginHistory.sort((a, b) => new Date(a) - new Date(b));
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Check if already logged in today
      const loginToday = loginHistory.includes(today);
      
      // Check if logged in yesterday
      const loginYesterday = loginHistory.includes(yesterdayStr);
      
      let currentStreak = 1; // Start with 1 for today
      
      if (loginToday || loginYesterday) {
        // Start counting from the most recent login date before today
        let checkDate = loginYesterday ? yesterdayStr : loginHistory[loginHistory.length - 1];
        let streakDays = loginToday ? 1 : 0; // Start count with today if applicable
        
        // Convert checkDate to Date object for easy date manipulation
        let currentDate = new Date(checkDate);
        
        // Go backward through history
        for (let i = loginHistory.length - 1; i >= 0; i--) {
          const historyDate = new Date(loginHistory[i]);
          
          // Create previous day to check
          const prevDate = new Date(currentDate);
          prevDate.setDate(prevDate.getDate() - 1);
          
          // If this history date equals the previous day we're looking for
          if (historyDate.toISOString().split('T')[0] === prevDate.toISOString().split('T')[0]) {
            streakDays++;
            currentDate = historyDate;
          } else if (historyDate.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]) {
            // Same day login, continue
            continue;
          } else {
            // Streak is broken
            break;
          }
        }
        
        currentStreak = streakDays;
      }
      
      return currentStreak;
    } catch (e) {
      console.error("Error calculating streak:", e);
      return 1; // Default fallback
    }
  };

  // Record today's login in local storage
  const recordLogin = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const loginHistory = JSON.parse(localStorage.getItem('loginHistory')) || [];
      
      // Only add today if not already present
      if (!loginHistory.includes(today)) {
        loginHistory.push(today);
        localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
      }
    } catch (e) {
      console.error("Error recording login:", e);
    }
  };

  // Prepare metrics for display
  const metricItems = [
    {
      label: "Task Completion",
      value: `${metrics.taskCompletionRate}%`,
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      description: "Completed tasks rate",
    },
    {
      label: "Total Tasks",
      value: metrics.totalTasks,
      icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
      description: "Tasks created",
    },
    {
      label: "Projects",
      value: metrics.projectsCount,
      icon: <Briefcase className="h-5 w-5 text-indigo-500" />,
      description: "Active projects",
    },
    {
      label: "Focus Time",
      value: `${metrics.pomodoroTime}h`,
      icon: <Clock className="h-5 w-5 text-red-500" />,
      description: "Pomodoro hours",
    },
    {
      label: "Streak",
      value: metrics.streak,
      icon: <Flame className="h-5 w-5 text-amber-500" />,
      description: "Day streak",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Productivity Insights</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">
            {error}
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {metricItems.map((metric, index) => (
                <div key={index} className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                  <div className="mb-2">{metric.icon}</div>
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-xs text-muted-foreground mt-1">{metric.label}</span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Recent Activity */}
            {activities.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Recent Activity</h3>
                </div>

                <div className="space-y-2">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors ${
                        activity.type === 'task' 
                          ? 'border-l-2 border-emerald-500' 
                          : activity.type === 'pomodoro'
                            ? 'border-l-2 border-red-500'
                            : activity.type === 'login'
                              ? 'border-l-2 border-amber-500'
                              : ''
                      }`}
                    >
                      <span className="text-sm">{activity.description}</span>
                      <span className="text-xs text-muted-foreground">{activity.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No recent activity
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

