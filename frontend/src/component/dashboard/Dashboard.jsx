import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  AreaChart, Area
} from "recharts";

const StatCard = ({ title, value, icon, trend, color = "blue", loading = false }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}>
    {loading ? (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    ) : (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              {trend > 0 ? '↑' : '↓'} 
              <span className="ml-1">{Math.abs(trend)}% from last month</span>
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center transform transition-transform group-hover:rotate-12`}>
          <svg className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    )}
  </div>
);

const QuickAction = ({ title, description, icon, color = "blue", onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 w-full text-left group hover:shadow-lg transform hover:-translate-y-1"
  >
    <div className="flex items-start space-x-4">
      <div className={`w-12 h-12 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center group-hover:bg-${color}-200 dark:group-hover:bg-${color}-900/40 transition-colors transform group-hover:rotate-12`}>
        <svg className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  </button>
);

const RecentActivity = ({ activities, loading = false }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-lg">
    <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {loading ? (
        [...Array(3)].map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))
      ) : activities.length > 0 ? (
        activities.map((activity, index) => (
          <div key={index} className="px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
            <div className={`w-8 h-8 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-900/20 flex items-center justify-center transform transition-transform group-hover:rotate-12`}>
              <svg className={`w-4 h-4 text-${activity.color}-600 dark:text-${activity.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activity.icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
          </div>
        ))
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      )}
    </div>
  </div>
);

const ChartCard = ({ title, children, description = null }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>}
    <div className="h-64 w-full">
      {children}
    </div>
  </div>
);

const generateTaskData = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
  }
  
  return dates.map(date => ({
    day: date,
    completed: Math.floor(Math.random() * 8),
    pending: Math.floor(Math.random() * 5),
    overdue: Math.floor(Math.random() * 3),
  }));
};

const generatePomodoroData = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
  }
  
  return dates.map(date => ({
    day: date,
    focusTime: Math.floor(Math.random() * 120) + 30,
    sessionsCompleted: Math.floor(Math.random() * 8) + 1,
  }));
};

const generateHabitData = () => {
  const habitNames = ['Exercise', 'Reading', 'Meditation', 'Journaling', 'Coding'];
  
  return habitNames.map(habit => ({
    name: habit,
    completionRate: Math.floor(Math.random() * 100),
    streak: Math.floor(Math.random() * 30),
    totalCheckins: Math.floor(Math.random() * 100) + 20,
  }));
};

const generateUsageData = () => {
  return [
    { subject: 'Tasks', usage: Math.floor(Math.random() * 100) },
    { subject: 'Pomodoro', usage: Math.floor(Math.random() * 100) },
    { subject: 'Habits', usage: Math.floor(Math.random() * 100) },
    { subject: 'File Converter', usage: Math.floor(Math.random() * 100) },
    { subject: 'Notepad', usage: Math.floor(Math.random() * 100) },
    { subject: 'Code Editor', usage: Math.floor(Math.random() * 100) },
  ];
};

export default function Dashboard() {
  const userData = JSON.parse(localStorage.getItem("userData")) || { username: "User" };
  
  const stats = [
    {
      title: "Tasks Due Today",
      value: "5",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      trend: 12,
      color: "blue"
    },
    {
      title: "Projects in Progress",
      value: "3",
      icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
      trend: -5,
      color: "purple"
    },
    {
      title: "Completed Tasks",
      value: "12",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      trend: 8,
      color: "green"
    },
    {
      title: "Upcoming Deadlines",
      value: "8",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      trend: 0,
      color: "orange"
    }
  ];

  const quickActions = [
    {
      title: "Create New Task",
      description: "Add a new task to your list",
      icon: "M12 4v16m8-8H4",
      color: "blue"
    },
    {
      title: "Start New Project",
      description: "Initialize a new project workspace",
      icon: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "purple"
    },
    {
      title: "Schedule Meeting",
      description: "Set up a meeting with your team",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "green"
    },
    {
      title: "Generate Report",
      description: "Create a new activity report",
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "orange"
    }
  ];

  const recentActivities = [
    {
      title: "Task Completed",
      description: "Frontend UI Implementation",
      time: "2h ago",
      icon: "M5 13l4 4L19 7",
      color: "green"
    },
    {
      title: "New Project Created",
      description: "Productivity Dashboard",
      time: "4h ago",
      icon: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "blue"
    },
    {
      title: "Meeting Scheduled",
      description: "Weekly Team Sync",
      time: "6h ago",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "purple"
    }
  ];

  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState([]);
  const [pomodoroData, setPomodoroData] = useState([]);
  const [habitData, setHabitData] = useState([]);
  const [usageData, setUsageData] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTaskData(generateTaskData());
      setPomodoroData(generatePomodoroData());
      setHabitData(generateHabitData());
      setUsageData(generateUsageData());
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickAction = (action) => {
    console.log(`Quick action clicked: ${action}`);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="px-4 py-6 lg:px-8 max-w-[2000px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-300 dark:bg-blue-500 p-4 rounded-lg w-full">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <div className="text-lg font-bold md:text-3xl lg:text-4xl text-gray-900 dark:text-white">
            Welcome back, {userData.username}!
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-300 font-medium">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${showAnalytics ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 'bg-blue-600 text-black dark:text-white hover:bg-blue-700'}`}
            onClick={() => setShowAnalytics(false)}
          >
            Dashboard
          </button>
          <button 
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${!showAnalytics ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 'bg-blue-600 text-black dark:text-white hover:bg-blue-700'}`}
            onClick={() => setShowAnalytics(true)}
          >
            Analytics
          </button>
        </div>
      </div>

      {!showAnalytics ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} loading={loading} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                {...action}
                onClick={() => handleQuickAction(action.title)}
              />
            ))}
          </div>

          <div className="w-full">
            <RecentActivity activities={recentActivities} loading={loading} />
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
            <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Task Completion Analytics" description="Completed vs pending tasks over the past week">
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
            </ChartCard>

            <ChartCard title="Focus Time Tracking" description="Your daily pomodoro focus sessions">
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
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Habit Completion Rate" description="Your active habits and completion rates">
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
            </ChartCard>

            <ChartCard title="Feature Usage Distribution" description="Which features you use the most">
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
            </ChartCard>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Personalized Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Your most productive day</span> is Wednesday, with an average of 8 completed tasks.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Your focus peaks</span> between 9:00 AM and 11:00 AM. Try scheduling your most important tasks during this time.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Habit consistency:</span> You're most consistent with your "Exercise" habit at 78% completion rate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
