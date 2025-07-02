import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const NotificationCenter = () => {
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  // Apply filters when notifications or filter changes
  useEffect(() => {
    if (!notifications) return;
    
    let filtered = [...notifications];
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, filter]);
  
  // Refresh notifications
  const handleRefresh = () => {
    fetchNotifications();
  };
  
  // Mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  // View notification details
  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };
  
  // Close notification details
  const handleCloseDetails = () => {
    setSelectedNotification(null);
  };
  
  // Delete notification confirmation
  const handleDeleteConfirmation = (notificationId) => {
    setDeleteConfirmation(notificationId);
  };
  
  // Delete notification
  const handleDeleteNotification = () => {
    if (deleteConfirmation) {
      deleteNotification(deleteConfirmation);
      
      // If deleted notification is currently selected, clear it
      if (selectedNotification && selectedNotification.id === deleteConfirmation) {
        setSelectedNotification(null);
      }
      
      setDeleteConfirmation(null);
    }
  };
  
  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
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
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SCHEDULE':
        return (
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'TEST':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'MATERIAL':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'SYSTEM':
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">Trung tâm thông báo</h1>
      </div>
      
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center">
        <div className="flex space-x-2 mb-2 sm:mb-0">
          <button 
            className={`px-3 py-1 rounded-md text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`px-3 py-1 rounded-md text-sm ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setFilter('unread')}
          >
            Chưa đọc
          </button>
          <button 
            className={`px-3 py-1 rounded-md text-sm ${filter === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setFilter('read')}
          >
            Đã đọc
          </button>
        </div>
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 flex items-center"
            onClick={handleRefresh}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
          <button 
            className="px-3 py-1 rounded-md text-sm bg-gray-600 text-white hover:bg-gray-700 flex items-center"
            onClick={handleMarkAllAsRead}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex flex-col md:flex-row">
        {/* Notification list */}
        <div className="md:w-1/2 lg:w-2/5 border-r border-gray-200 h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              <p>{error}</p>
              <button 
                className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleRefresh}
              >
                Thử lại
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="mt-2">Không có thông báo nào</p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''} ${selectedNotification?.id === notification.id ? 'bg-blue-100' : ''}`}
                  onClick={() => handleViewDetails(notification)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Notification detail */}
        <div className="md:w-1/2 lg:w-3/5 p-4 h-[70vh] overflow-y-auto">
          {selectedNotification ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{selectedNotification.title}</h2>
                <button 
                  className="text-gray-600 hover:text-red-600"
                  onClick={() => handleDeleteConfirmation(selectedNotification.id)}
                  aria-label="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center mb-4 text-sm text-gray-500">
                <div className="flex items-center mr-4">
                  {getNotificationIcon(selectedNotification.type)}
                  <span className="ml-1">
                    {selectedNotification.type === 'SCHEDULE' ? 'Lịch học' : 
                     selectedNotification.type === 'TEST' ? 'Kiểm tra' : 
                     selectedNotification.type === 'MATERIAL' ? 'Tài liệu' : 'Hệ thống'}
                  </span>
                </div>
                <div>
                  {formatDate(selectedNotification.createdAt)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>
              
              {selectedNotification.link && (
                <div className="mt-4">
                  <a 
                    href={selectedNotification.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Mở liên kết
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <p className="mt-2">Chọn một thông báo để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa thông báo này không?</p>
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={handleCancelDelete}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteNotification}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;