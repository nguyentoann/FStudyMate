// API URL cho backend
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Các đường dẫn trong ứng dụng
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
}; 