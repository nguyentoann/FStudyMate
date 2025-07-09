import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getMyNotifications,
  getMyUnreadNotifications,
  countMyUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notificationService';

// Create context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotifications = () => useContext(NotificationContext);

// Provider component
export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Set up polling for new notifications
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 60000); // Check for new notifications every minute
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);
  
  // Fetch all notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMyNotifications();
      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch unread notifications
  const fetchUnreadNotifications = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMyUnreadNotifications();
      if (response.success) {
        setUnreadNotifications(response.notifications);
      }
    } catch (err) {
      setError('Failed to fetch unread notifications');
      console.error('Error fetching unread notifications:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await countMyUnreadNotifications();
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };
  
  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await markNotificationAsRead(notificationId);
      if (response.success) {
        // Update notifications state
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true } 
              : notification
          )
        );
        
        // Update unread notifications state
        setUnreadNotifications(prevUnreadNotifications => 
          prevUnreadNotifications.filter(notification => 
            notification.id !== notificationId
          )
        );
        
        // Update unread count
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      return response.success;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await markAllNotificationsAsRead();
      if (response.success) {
        // Update notifications state
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ 
            ...notification, 
            isRead: true 
          }))
        );
        
        // Clear unread notifications
        setUnreadNotifications([]);
        
        // Reset unread count
        setUnreadCount(0);
      }
      return response.success;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  };
  
  // Filter notifications by role
  const getNotificationsByRole = (role) => {
    return notifications.filter(notification => 
      notification.notificationType === 'ROLE' && 
      // This is a simplification - in a real app, you'd have the target role in the notification
      // For now, we'll assume all ROLE type notifications are relevant
      true
    );
  };
  
  // Refresh notifications
  const refreshNotifications = () => {
    fetchNotifications();
    fetchUnreadNotifications();
    fetchUnreadCount();
  };
  
  // Context value
  const value = {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationsByRole,
    refreshNotifications
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 