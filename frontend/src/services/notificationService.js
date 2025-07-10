import apiHelper from './apiHelper';

const BASE_URL = '/notifications';

const notificationService = {
  // Get notifications for current user
  getNotifications: async (userId) => {
    try {
      const response = await apiHelper.get(`${BASE_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
  
  // Get unread notifications for current user
  getUnreadNotifications: async (userId) => {
    try {
      const response = await apiHelper.get(`${BASE_URL}/user/${userId}/unread`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },
  
  // Count unread notifications for current user
  countUnreadNotifications: async (userId) => {
    try {
      const response = await apiHelper.get(`${BASE_URL}/user/${userId}/unread/count`);
      return response.data.count;
    } catch (error) {
      console.error('Error counting unread notifications:', error);
      return 0;
    }
  },
  
  // Mark notification as read
  markAsRead: async (notificationId, userId) => {
  try {
      const response = await apiHelper.put(`${BASE_URL}/${notificationId}/read/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async (userId) => {
    try {
      const response = await apiHelper.put(`${BASE_URL}/user/${userId}/read-all`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  // Create a notification
  createNotification: async (notificationData) => {
    try {
      const response = await apiHelper.post(BASE_URL, notificationData);
      return response.data;
  } catch (error) {
      console.error('Error creating notification:', error);
    throw error;
  }
  },
  
  // Create notification with attachment
  createNotificationWithAttachment: async (formData) => {
  try {
      const response = await apiHelper.post(`${BASE_URL}/with-attachment`, formData, {
      headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating notification with attachment:', error);
      throw error;
    }
  },
  
  // Get notifications sent by current user
  getSentNotifications: async (userId) => {
    try {
      const response = await apiHelper.get(`${BASE_URL}/sent-by/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
      throw error;
    }
  },
  
  // Unsend notification
  unsendNotification: async (notificationId, senderId) => {
    try {
      const response = await apiHelper.put(`${BASE_URL}/${notificationId}/unsend/${senderId}`);
      return response.data;
    } catch (error) {
      console.error('Error unsending notification:', error);
      throw error;
    }
  },
  
  // Get notification by ID
  getNotificationById: async (notificationId) => {
    try {
      const response = await apiHelper.get(`${BASE_URL}/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification details:', error);
      throw error;
    }
  },
  
  // Delete notification
  deleteNotification: async (notificationId, userId) => {
    try {
      await apiHelper.delete(`${BASE_URL}/${notificationId}/user/${userId}`);
      return true;
  } catch (error) {
      console.error('Error deleting notification:', error);
    throw error;
    }
  }
}; 

export default notificationService; 