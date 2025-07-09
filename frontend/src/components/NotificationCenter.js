import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const { notifications, loading, error, fetchNotifications, markAsRead } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread, read
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Handle mark as read
  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };
  
  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });
  
  return (
    <div className="bg-white shadow rounded-lg p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'unread'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === 'read'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {!loading && filteredNotifications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No notifications found
        </div>
      )}
      
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`border-l-4 ${
              notification.isRead ? 'border-gray-300' : 'border-indigo-500'
            } bg-white p-4 shadow-sm rounded-md`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-medium text-gray-900">{notification.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-xs text-gray-500">
                    {formatDate(notification.createdAt)}
                  </span>
                  <span className="text-xs text-gray-500">
                    From: {notification.senderName || 'System'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Type: {notification.notificationType}
                  </span>
                </div>
              </div>
              
              {!notification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter; 