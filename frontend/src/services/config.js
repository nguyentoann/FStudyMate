/**
 * API Configuration for different environments
 */

// Get the current hostname
const hostname = window.location.hostname;

// Check if we're running on localhost or accessing from another device
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

// Define the API base URL
let API_BASE_URL;

if (isLocalhost) {
  // When running locally on a browser on the same machine
  API_BASE_URL = `http://${hostname}:8080`;
} else if (hostname === 'fstudy.tinymation.com') {
  // When accessing from the production domain, use specific backend
  API_BASE_URL = 'http://toandz.ddns.net:8080';
} else {
  // When accessing from another device on the network (like a phone)
  // Use the same hostname that loaded the frontend, but with backend port
  // This works with port forwarding from Windows host to WSL
  API_BASE_URL = `http://${hostname}:8080`;
}

// Export the configurations
export const API_URL = API_BASE_URL + '/api';
export const OPEN_URL = API_BASE_URL + '/open';
export const PUBLIC_URL = API_BASE_URL + '/public';
export const EMERGENCY_URL = API_BASE_URL + '/emergency';

// Log the API URLs for debugging
console.log('API configuration loaded:');
console.log('- API_URL:', API_URL);
console.log('- OPEN_URL:', OPEN_URL);
console.log('- PUBLIC_URL:', PUBLIC_URL);
console.log('- EMERGENCY_URL:', EMERGENCY_URL);

export default {
  API_URL,
  OPEN_URL,
  PUBLIC_URL,
  EMERGENCY_URL
}; 