import React, { useState, useEffect } from "react";

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

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickAction = (action) => {
    // Handle quick actions here
    console.log(`Quick action clicked: ${action}`);
  };

  return (
    <div className="px-4 py-6 lg:px-8 max-w-[2000px] mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-300 dark:bg-blue-500 p-4 rounded-lg w-full">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <div className="text-lg font-bold md:text-3xl lg:text-4xl text-gray-900 dark:text-white">
            Welcome back, {userData.username}!
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-300 font-medium">
            Here's what's happening with your projects today.
          </p>
        </div>
        <button className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-black dark:text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          + New Project
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {quickActions.map((action, index) => (
          <QuickAction
            key={index}
            {...action}
            onClick={() => handleQuickAction(action.title)}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="w-full">
        <RecentActivity activities={recentActivities} loading={loading} />
      </div>
    </div>
  );
}
