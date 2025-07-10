import axios from 'axios';
import { API_URL } from './config';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  config => {
    // Get session ID from localStorage to use as authentication token
    const sessionId = localStorage.getItem('sessionId');
    
    if (sessionId) {
      // Add session ID as authorization header
      config.headers['Authorization'] = `Bearer ${sessionId}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Simple API wrapper
const apiHelper = {
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data = {}, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data = {}, config = {}) => axiosInstance.put(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config)
};

export default apiHelper; 