import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../../service/api';
import { X, Bell, Clock, Calendar, Award, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.notification_type === 'task' && notification.task_id) {
      navigate(`/tasks?highlight=${notification.task_id}`);
    } else if (notification.notification_type === 'habit' && notification.habit_id) {
      navigate(`/habit-tracker?highlight=${notification.habit_id}`);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'habit':
        return <Award className="w-5 h-5 text-purple-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h3>
          <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Back to Dashboard
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-4 mb-4">
              <Bell className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No notifications</h4>
            <p className="text-gray-600 dark:text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map(notification => (
              <li
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`py-4 flex cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-3 ${
                  notification.is_read 
                    ? 'bg-white dark:bg-gray-800' 
                    : 'bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex-shrink-0 mr-4 mt-1">
                  {getNotificationIcon(notification.notification_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className={`text-sm font-medium ${
                      notification.is_read 
                        ? 'text-gray-900 dark:text-gray-100' 
                        : 'text-blue-800 dark:text-blue-300'
                    }`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                </div>
                
                {!notification.is_read && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;