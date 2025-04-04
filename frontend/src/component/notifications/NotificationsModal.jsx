import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../../service/api';
import { X, Clock, Calendar, Award, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsModal = ({ onClose }) => {
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
      setNotifications(
        notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
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
    
    onClose(); // Close the modal overlay
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay background */}
      <div 
        className="absolute inset-0 bg-black opacity-60" 
        onClick={onClose}
      ></div>
      {/* Modal content */}
      <div className="relative z-50 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-6 h-6"/>
          </button>
        </div>
        {error && (
          <div className="px-6 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-10 h-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3 mb-4">
                <Calendar className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <ul>
              {notifications.map(notification => (
                <li
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer px-6 py-4 border-b last:border-b-0 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${notification.is_read ? 'bg-gray-50 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900/30'}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;