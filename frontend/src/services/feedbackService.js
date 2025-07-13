import axios from 'axios';
import { API_URL } from './config';

// Helper function to get auth token from storage
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
};

// Create axios instance with default config
const axiosInstance = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

const FeedbackService = {
  // Create new feedback
  createFeedback: async (feedback) => {
    try {
      console.log('Sending feedback to API:', feedback);
      console.log('API URL:', `${API_URL}/feedback`);
      const response = await axiosInstance.post(`${API_URL}/feedback`, feedback);
      return response.data;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  // Get feedback by ID
  getFeedbackById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedbacks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Get all feedback
  getAllFeedback: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedbacks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      throw error;
    }
  },

  // Get feedback by user ID
  getFeedbackByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedbacks/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback for user ID ${userId}:`, error);
      throw error;
    }
  },

  // Get feedback by status
  getFeedbackByStatus: async (status) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedbacks/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback with status ${status}:`, error);
      throw error;
    }
  },

  // Update feedback
  updateFeedback: async (id, feedbackDetails) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/feedbacks/${id}`, feedbackDetails);
      return response.data;
    } catch (error) {
      console.error(`Error updating feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Update feedback status
  updateFeedbackStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/feedbacks/${id}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating status of feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/feedbacks/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Get feedback statistics
  getFeedbackStatistics: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedbacks/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback statistics:', error);
      throw error;
    }
  },
  
  // Get current user's feedback
  getMyFeedback: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedbacks/mine`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my feedback:', error);
      throw error;
    }
  },
  
  // ===== Feedback Reply Methods =====
  
  // Create a new reply
  createReply: async (replyData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/feedback-replies`, replyData);
      return response.data;
    } catch (error) {
      console.error('Error creating reply:', error);
      throw error;
    }
  },
  
  // Create a nested reply
  createNestedReply: async (parentReplyId, replyData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/feedback-replies/${parentReplyId}/replies`, replyData);
      return response.data;
    } catch (error) {
      console.error(`Error creating nested reply for parent ID ${parentReplyId}:`, error);
      throw error;
    }
  },
  
  // Get replies for a feedback
  getRepliesByFeedbackId: async (feedbackId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedback-replies/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching replies for feedback ID ${feedbackId}:`, error);
      throw error;
    }
  },
  
  // Get nested replies for a parent reply
  getNestedReplies: async (parentReplyId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedback-replies/parent/${parentReplyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching nested replies for parent reply ID ${parentReplyId}:`, error);
      throw error;
    }
  },
  
  // Delete a reply
  deleteReply: async (replyId) => {
    try {
      console.log(`Attempting to delete reply with ID ${replyId}`);
      const response = await axiosInstance.delete(`${API_URL}/feedback-replies/${replyId}`);
      console.log(`Successfully deleted reply with ID ${replyId}`, response.data);
      return true;
    } catch (error) {
      console.error(`Error deleting reply with ID ${replyId}:`, error);
      
      // Add more detailed error logging
      if (error.response) {
        console.error(`Status: ${error.response.status}, Data:`, error.response.data);
      }
      
      throw error;
    }
  },

  // Update a reply
  updateReply: async (replyId, replyData) => {
    try {
      console.log(`Updating reply with ID ${replyId}`, replyData);
      const response = await axiosInstance.put(`${API_URL}/feedback-replies/${replyId}`, replyData);
      console.log(`Successfully updated reply with ID ${replyId}`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating reply with ID ${replyId}:`, error);
      
      // Add more detailed error logging
      if (error.response) {
        console.error(`Status: ${error.response.status}, Data:`, error.response.data);
      }
      
      throw error;
    }
  }
};

export default FeedbackService; 