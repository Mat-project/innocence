import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../../service/api';
import { X, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

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
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
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
        {error && <p className="text-red-500">{error}</p>}
        <ul>
          {notifications.map(notification => (
            <li
              key={notification.id}
              className={`p-4 border-b last:border-none flex justify-between items-center ${notification.is_read ? 'bg-gray-100' : 'bg-blue-50'}`}
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{notification.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
              </div>
              {!notification.is_read && (
                <button onClick={() => markAsRead(notification.id)}>
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsPage;