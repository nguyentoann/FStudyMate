import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Close dropdown after a short delay to allow navigation
    setTimeout(() => {
      setShowDropdown(false);
    }, 100);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="text-white hover:text-gray-200 focus:outline-none" 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Thông báo</h3>
            <Link 
              to="/notifications" 
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => setShowDropdown(false)}
            >
              Xem tất cả
            </Link>
          </div>
          
          {notifications && notifications.length > 0 ? (
            <div>
              {notifications.slice(0, 5).map(notification => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-3 hover:bg-gray-100 border-b border-gray-100 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${!notification.isRead ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-gray-500">
              <p>Không có thông báo nào</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 