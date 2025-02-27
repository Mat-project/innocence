import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../../service/api';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsModal = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to load notifications.');
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
    if (notification.task) {
      // Navigate to the related task's detail page (adjust as needed)
      navigate(`/tasks/${notification.task}/`);
    }
    onClose(); // Close the modal overlay
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
          <ul>
            {notifications.map(notification => (
              <li
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`cursor-pointer px-6 py-4 border-b last:border-b-0 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${notification.is_read ? 'bg-gray-50 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900/30'}`}
              >
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {notification.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;