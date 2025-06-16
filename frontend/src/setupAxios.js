// This file patches axios to work with our polyfills
import axios from 'axios';

// Fix for axios expecting process
if (typeof process === 'undefined' || !process.version) {
  // Ensure process.version exists as axios checks for it
  if (!window.process) {
    window.process = {};
  }
  window.process.version = '16.0.0'; // Fake Node.js version
}

// Set global defaults for axios
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(config => {
  // Log request for debugging
  console.log(`[Axios Request] ${config.method.toUpperCase()} ${config.url}`);
  return config;
}, error => {
  return Promise.reject(error);
});

// Add response interceptor for debugging
axios.interceptors.response.use(response => {
  // Log success responses
  console.log(`[Axios Response] ${response.status} ${response.config.url}`);
  return response;
}, error => {
  // Log error responses
  if (error.response) {
    console.error(`[Axios Error] ${error.response.status} ${error.config.url}`, error.response.data);
  } else if (error.request) {
    console.error(`[Axios Error] No response received for ${error.config.url}`);
  } else {
    console.error(`[Axios Error] ${error.message}`);
  }
  return Promise.reject(error);
});

export default axios; 