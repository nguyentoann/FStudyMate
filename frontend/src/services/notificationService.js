import { API_URL } from './config';

// Hàm trợ giúp để lấy token xác thực
const getAuthToken = () => {
  // Lấy thông tin user từ localStorage hoặc sessionStorage
  const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
  
  if (!userData) {
    return null;
  }
  
  try {
    const user = JSON.parse(userData);
    return user.token || null;
  } catch (error) {
    console.error('Error parsing auth token:', error);
    return null;
  }
};

/**
 * Send a notification to a user
 * 
 * @param {number} userId - User ID to send notification to
 * @param {string} subject - Notification subject
 * @param {string} message - Notification message
 * @returns {Promise} - Response from API
 */
export const sendNotification = async (userId, subject, message) => {
  try {
    const response = await fetch(`${API_URL}/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        userId,
        subject,
        message,
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send notification');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Send a notification to a user by email
 * 
 * @param {string} email - User email to send notification to
 * @param {string} subject - Notification subject
 * @param {string} message - Notification message
 * @returns {Promise} - Response from API
 */
export const sendNotificationByEmail = async (email, subject, message) => {
  try {
    const response = await fetch(`${API_URL}/notifications/send-by-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        email,
        subject,
        message,
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send notification');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending notification by email:', error);
    throw error;
  }
};

/**
 * Create a new notification
 * 
 * @param {number} userId - User ID to send notification to
 * @param {string} type - Type of notification (SCHEDULE, TEST, MATERIAL, etc.)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link related to notification
 * @param {number} resourceId - Optional ID of related resource
 * @returns {Promise} - Response from API
 */
export const createNotification = async (userId, type, title, message, link = null, resourceId = null) => {
  try {
    const response = await fetch(`${API_URL}/notifications/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        userId,
        type,
        title,
        message,
        link,
        resourceId
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create notification');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get all notifications for current user
 * 
 * @returns {Promise} - Response from API
 */
export const getUserNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to get notifications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

/**
 * Get paginated notifications
 * 
 * @param {number} page - Page number
 * @param {number} size - Page size
 * @returns {Promise} - Response from API
 */
export const getPaginatedNotifications = async (page = 0, size = 10) => {
  try {
    const response = await fetch(`${API_URL}/notifications/paginated?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to get notifications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting paginated notifications:', error);
    throw error;
  }
};

/**
 * Get unread notifications for current user
 * 
 * @returns {Promise} - Response from API
 */
export const getUnreadNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/notifications/unread`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to get unread notifications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    throw error;
  }
};

/**
 * Count unread notifications for current user
 * 
 * @returns {Promise<number>} - Number of unread notifications
 */
export const countUnreadNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/notifications/count-unread`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to count unread notifications');
    }
    
    const result = await response.json();
    return result.count;
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return 0; // Default to 0 on error
  }
};

/**
 * Mark a notification as read
 * 
 * @param {number} notificationId - ID of notification to mark as read
 * @returns {Promise} - Response from API
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to mark notification as read');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for current user
 * 
 * @returns {Promise} - Response from API
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to mark all notifications as read');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * 
 * @param {number} notificationId - ID of notification to delete
 * @returns {Promise} - Response from API
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete notification');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Clear old notifications (older than specified days)
 * 
 * @param {number} days - Number of days to keep notifications
 * @returns {Promise} - Response from API
 */
export const clearOldNotifications = async (days) => {
  try {
    const response = await fetch(`${API_URL}/notifications/clear-old/${days}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to clear old notifications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error clearing old notifications:', error);
    throw error;
  }
}; 