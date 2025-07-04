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
      const response = await axiosInstance.get(`${API_URL}/feedback/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Get all feedback
  getAllFeedback: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedback`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      throw error;
    }
  },

  // Get feedback by user ID
  getFeedbackByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedback/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback for user ID ${userId}:`, error);
      throw error;
    }
  },

  // Get feedback by status
  getFeedbackByStatus: async (status) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedback/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedback with status ${status}:`, error);
      throw error;
    }
  },

  // Update feedback
  updateFeedback: async (id, feedbackDetails) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/feedback/${id}`, feedbackDetails);
      return response.data;
    } catch (error) {
      console.error(`Error updating feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Update feedback status
  updateFeedbackStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(`${API_URL}/feedback/${id}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating status of feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/feedback/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting feedback with ID ${id}:`, error);
      throw error;
    }
  },

  // Get feedback statistics
  getFeedbackStatistics: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/feedback/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback statistics:', error);
      throw error;
    }
  }
};

export default FeedbackService; 