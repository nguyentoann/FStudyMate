import { API_URL } from './config';
import { getAuthToken } from '../utils/AuthUtils';

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

/**
 * Send notification to a specific user
 * 
 * @param {number} recipientId - ID of user to send notification to
 * @param {string} type - Type of notification (SCHEDULE, TEST, MATERIAL, etc.)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link
 * @param {number} resourceId - Optional related resource ID
 * @returns {Promise} - Response from API
 */
export const sendNotificationToUser = async (recipientId, type, title, message, link = null, resourceId = null) => {
  try {
    const response = await fetch(`${API_URL}/notification-management/send-to-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        recipientId,
        type,
        title,
        message,
        link,
        resourceId
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send notification');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending notification to user:', error);
    throw error;
  }
};

/**
 * Send notification to multiple users
 * 
 * @param {Array<number>} recipientIds - IDs of users to send notification to
 * @param {string} type - Type of notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link
 * @param {number} resourceId - Optional related resource ID
 * @returns {Promise} - Response from API
 */
export const sendNotificationToUsers = async (recipientIds, type, title, message, link = null, resourceId = null) => {
  try {
    const response = await fetch(`${API_URL}/notification-management/send-to-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        recipientIds,
        type,
        title,
        message,
        link,
        resourceId
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send notifications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending notifications to users:', error);
    throw error;
  }
};

/**
 * Send notification to all users (admin only)
 * 
 * @param {string} type - Type of notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link
 * @param {number} resourceId - Optional related resource ID
 * @returns {Promise} - Response from API
 */
export const sendNotificationToAll = async (type, title, message, link = null, resourceId = null) => {
  try {
    const response = await fetch(`${API_URL}/notification-management/send-to-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        type,
        title,
        message,
        link,
        resourceId
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send notifications to all users');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending notifications to all users:', error);
    throw error;
  }
};

/**
 * Send notification to all lecturers (admin only)
 * 
 * @param {string} type - Type of notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link
 * @param {number} resourceId - Optional related resource ID
 * @returns {Promise} - Response from API
 */
export const sendNotificationToLecturers = async (type, title, message, link = null, resourceId = null) => {
  try {
    const response = await fetch(`${API_URL}/notification-management/send-to-all-lecturers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        type,
        title,
        message,
        link,
        resourceId
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send notifications to all lecturers');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending notifications to all lecturers:', error);
    throw error;
  }
};

/**
 * Send notification to all students (admin and lecturer)
 * 
 * @param {string} type - Type of notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link
 * @param {number} resourceId - Optional related resource ID
 * @returns {Promise} - Response from API
 */
export const sendNotificationToStudents = async (type, title, message, link = null, resourceId = null) => {
  try {
    const response = await fetch(`${API_URL}/notification-management/send-to-all-students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        type,
        title,
        message,
        link,
        resourceId
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send notifications to all students');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending notifications to all students:', error);
    throw error;
  }
};

/**
 * Send notification to all students in a class
 * 
 * @param {string} classId - Class ID
 * @param {string} type - Type of notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link
 * @param {number} resourceId - Optional related resource ID
 * @returns {Promise} - Response from API
 */
export const sendNotificationToClass = async (classId, type, title, message, link = null, resourceId = null) => {
  try {
    const response = await fetch(`${API_URL}/notification-management/send-to-class/${classId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        type,
        title,
        message,
        link,
        resourceId
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send notifications to class');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending notifications to class:', error);
    throw error;
  }
};

/**
 * Schedule a notification for a specific user
 * 
 * @param {number} userId - User ID
 * @param {string} subject - Notification subject
 * @param {string} message - Notification message
 * @param {string} scheduledDate - ISO formatted date and time
 * @returns {Promise} - Response from API
 */
export const scheduleNotification = async (userId, subject, message, scheduledDate) => {
  try {
    const response = await fetch(`${API_URL}/scheduled-notifications/schedule-for-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        userId,
        subject,
        message,
        scheduledDate
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to schedule notification');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

/**
 * Schedule notifications for all users with a specific role
 * 
 * @param {string} role - Role (e.g., "student", "lecturer")
 * @param {string} subject - Notification subject
 * @param {string} message - Notification message
 * @param {string} scheduledDate - ISO formatted date and time
 * @returns {Promise} - Response from API
 */
export const scheduleNotificationForRole = async (role, subject, message, scheduledDate) => {
  try {
    const response = await fetch(`${API_URL}/scheduled-notifications/schedule-for-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        role,
        subject,
        message,
        scheduledDate
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to schedule notifications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error scheduling notifications for role:', error);
    throw error;
  }
};

/**
 * Schedule notifications for all students in a class
 * 
 * @param {string} classId - Class ID
 * @param {string} subject - Notification subject
 * @param {string} message - Notification message
 * @param {string} scheduledDate - ISO formatted date and time
 * @returns {Promise} - Response from API
 */
export const scheduleNotificationForClass = async (classId, subject, message, scheduledDate) => {
  try {
    const response = await fetch(`${API_URL}/scheduled-notifications/schedule-for-class/${classId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        subject,
        message,
        scheduledDate
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to schedule notifications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error scheduling notifications for class:', error);
    throw error;
  }
};

/**
 * Get all scheduled notifications (admin only)
 * 
 * @returns {Promise} - Response from API
 */
export const getAllScheduledNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/scheduled-notifications`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to get scheduled notifications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    throw error;
  }
};

/**
 * Get scheduled notifications for current user
 * 
 * @returns {Promise} - Response from API
 */
export const getScheduledNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/scheduled-notifications/my`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to get scheduled notifications');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    throw error;
  }
};

/**
 * Cancel a scheduled notification
 * 
 * @param {number} notificationId - ID of scheduled notification to cancel
 * @returns {Promise} - Response from API
 */
export const cancelScheduledNotification = async (notificationId) => {
  try {
    const response = await fetch(`${API_URL}/scheduled-notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to cancel scheduled notification');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error canceling scheduled notification:', error);
    throw error;
  }
}; 