import { API_URL } from './config';

/**
 * Create a notification
 * 
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.notificationType - Notification type (ALL, ROLE, CLASS, USERS)
 * @param {string} [notificationData.targetRole] - Target role for ROLE type notifications
 * @param {string} [notificationData.classId] - Class ID for CLASS type notifications
 * @param {Array<number>} [notificationData.userIds] - User IDs for USERS type notifications
 * @returns {Promise} - Response from API
 */
export const createNotification = async (notificationData) => {
  try {
    const response = await fetch(`${API_URL}/notifications/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(notificationData),
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
 * Get notifications for the current user
 * 
 * @returns {Promise} - Response from API
 */
export const getMyNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/notifications/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
 * Get unread notifications for the current user
 * 
 * @returns {Promise} - Response from API
 */
export const getMyUnreadNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/notifications/my/unread`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
 * Count unread notifications for the current user
 * 
 * @returns {Promise} - Response from API
 */
export const countMyUnreadNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/notifications/my/unread/count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to count unread notifications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * 
 * @param {number} notificationId - Notification ID
 * @returns {Promise} - Response from API
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
 * Mark all notifications as read
 * 
 * @returns {Promise} - Response from API
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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