import { API_URL } from './config';

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