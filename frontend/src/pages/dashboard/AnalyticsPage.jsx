import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  AreaChart, Area
} from "recharts";
import dashboardService from "../../services/dashboardService";

// Re-use the ChartCard component
const ChartCard = ({ title, children, description = null }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>}
    <div className="h-64 w-full">
      {children}
    </div>
  </div>
);

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskData, setTaskData] = useState([]);
  const [pomodoroData, setPomodoroData] = useState([]);
  const [habitData, setHabitData] = useState([]);
  const [usageData, setUsageData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [timeRange, setTimeRange] = useState('7');
  
  // Loading skeleton for charts
  const ChartSkeleton = () => (
    <div className="h-full w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Track analytics page view
      await dashboardService.trackFeatureUsage('Analytics');
      
      const [taskAnalytics, pomodoroStats, habitStats, featureUsage, insightsData] = await Promise.all([
        dashboardService.getTaskAnalytics(timeRange),
        dashboardService.getPomodoroStats(timeRange),
        dashboardService.getHabitStats(),
        dashboardService.getUsageStats(),
        dashboardService.getInsights(),
      ]);
      
      setTaskData(taskAnalytics);
      setPomodoroData(pomodoroStats);
      setHabitData(habitStats);
      setUsageData(featureUsage);
      setInsights(insightsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data. Using sample data instead.");
      
      // Use sample data as fallback
      setTaskData(generateSampleTaskData());
      setPomodoroData(generateSamplePomodoroData());
      setHabitData(generateSampleHabitData());
      setUsageData(generateSampleUsageData());
    } finally {
      setLoading(false);
    }
  };

  // Sample data generators
  const generateSampleTaskData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      completed: Math.floor(Math.random() * 8),
      pending: Math.floor(Math.random() * 5),
      overdue: Math.floor(Math.random() * 3),
    }));
  };

  const generateSamplePomodoroData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      focusTime: Math.floor(Math.random() * 120) + 30,
      sessionsCompleted: Math.floor(Math.random() * 8) + 1,
    }));
  };

  const generateSampleHabitData = () => {
    const habitNames = ['Exercise', 'Reading', 'Meditation', 'Journaling', 'Coding'];
    return habitNames.map(name => ({
      name,
      completionRate: Math.floor(Math.random() * 100),
      streak: Math.floor(Math.random() * 30),
      totalCheckins: Math.floor(Math.random() * 100) + 20,
    }));
  };

  const generateSampleUsageData = () => {
    const features = ['Tasks', 'Pomodoro', 'Habits', 'File Converter', 'Notepad', 'Code Editor'];
    return features.map(subject => ({
      subject,
      usage: Math.floor(Math.random() * 100),
    }));
  };

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Fetch data when component mounts or time range changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="px-4 py-6 lg:px-8 max-w-[2000px] mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Analytics</h1>
          <select 
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm"
            value={timeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
          </select>
        </div>
        
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your productivity and habits with detailed analytics
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg mb-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Task Completion Analytics" description="Completed vs pending tasks over the period">
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={taskData}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                barGap={0}
                barCategoryGap="15%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tasks`, ""]} />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Focus Time Tracking" description="Your pomodoro focus sessions">
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={pomodoroData}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} mins`, ""]} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="focusTime" 
                  name="Focus Time" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorFocus)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="sessionsCompleted" 
                  name="Sessions" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Habit Completion Rate" description="Your active habits and completion rates">
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={habitData}
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value}%`, ""]} />
                <Bar 
                  dataKey="completionRate" 
                  name="Completion Rate" 
                  fill="#8884d8"
                  radius={[0, 4, 4, 0]}
                  label={{ position: 'right', formatter: (value) => `${value}%` }}
                >
                  {habitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Feature Usage Distribution" description="Which features you use the most">
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={usageData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Radar 
                  name="Usage" 
                  dataKey="usage" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6} 
                />
                <Tooltip formatter={(value) => [`${value}%`, ""]} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Personalized Insights
        </h3>
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                  <div className="ml-3 w-full">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            insights.map((insight, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={insight.icon} />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{insight.title}</span> {insight.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
