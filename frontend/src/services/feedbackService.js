import api from './api';

const FeedbackService = {
  // Create new feedback
  createFeedback: async (feedback) => {
    try {
      const response = await api.post('/feedback', feedback);
      return response.data;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  // Get feedback by ID
  getFeedbackById: async (id) => {
    try {
      const response = await api.get(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Get all feedback
  getAllFeedback: async () => {
    try {
      const response = await api.get('/feedback');
      return response.data;
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      throw error;
    }
  },

  // Get feedback by user ID
  getFeedbackByUserId: async (userId) => {
    try {
      const response = await api.get(`/feedback/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback for user ID ${userId}:`, error);
      throw error;
    }
  },

  // Get feedback by status
  getFeedbackByStatus: async (status) => {
    try {
      const response = await api.get(`/feedback/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback with status ${status}:`, error);
      throw error;
    }
  },

  // Update feedback
  updateFeedback: async (id, feedbackDetails) => {
    try {
      const response = await api.put(`/feedback/${id}`, feedbackDetails);
      return response.data;
    } catch (error) {
      console.error(`Error updating feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Update feedback status
  updateFeedbackStatus: async (id, status) => {
    try {
      const response = await api.patch(`/feedback/${id}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating status of feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (id) => {
    try {
      await api.delete(`/feedback/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Get feedback statistics
  getFeedbackStatistics: async () => {
    try {
      const response = await api.get('/feedback/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback statistics:', error);
      throw error;
    }
  }
};

export default FeedbackService; 