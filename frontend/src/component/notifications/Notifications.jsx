import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../../service/api';
import { X } from 'lucide-react';

const Notifications = () => {
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
    <div className="max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-2">Notifications</h3>
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {notifications.map(notification => (
          <li
            key={notification.id}
            className={`p-3 border-b ${notification.is_read ? 'bg-gray-100' : 'bg-blue-50'} flex justify-between items-center`}
          >
            <div>
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm">{notification.message}</p>
            </div>
            {!notification.is_read && (
              <button onClick={() => markAsRead(notification.id)}>
                <X className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;