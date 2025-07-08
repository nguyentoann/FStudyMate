// Import polyfills first
import './setupPolyfills';
import './setupAxios'; // Import axios configuration

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/animations.css'; // Import animations CSS
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import the AuthUtils for debugging
import * as AuthUtils from './utils/AuthUtils';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Add function to show session expired notification
window.showSessionExpiredNotification = () => {
  // Create notification container if it doesn't exist
  let notificationContainer = document.getElementById('session-notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'session-notification-container';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '9999';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.style.backgroundColor = '#f8d7da';
  notification.style.color = '#721c24';
  notification.style.padding = '15px 20px';
  notification.style.marginBottom = '10px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.justifyContent = 'space-between';
  notification.style.minWidth = '300px';
  notification.style.animation = 'fadeIn 0.3s ease-out forwards';
  
  // Add notification content
  notification.innerHTML = `
    <div>
      <strong>Session Expired</strong>
      <p style="margin: 5px 0 0 0;">Your session has been terminated by an administrator.</p>
    </div>
    <button style="background: none; border: none; cursor: pointer; font-size: 16px; color: #721c24;">×</button>
  `;
  
  // Add to container
  notificationContainer.appendChild(notification);
  
  // Add close button functionality
  const closeButton = notification.querySelector('button');
  closeButton.addEventListener('click', () => {
    notification.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, 10000);
};

// Expose debugging utilities to window for console access in development
if (process.env.NODE_ENV === 'development') {
  window.AuthUtils = AuthUtils;
  window.inspectAuthState = AuthUtils.inspectAuthState;
  window.fixTokenStorage = AuthUtils.fixTokenStorage;
  
  // Add a convenient debug function
  window.debugVideoCall = () => {
    console.group('🔍 Video Call Debug Information');
    
    // Check session state
    const authState = AuthUtils.inspectAuthState();
    console.log('Session valid:', AuthUtils.isValidSession());
    
    // Try to fix session storage issues
    if (!authState.userData) {
      console.warn('No user data found. Please log in first.');
    } else if (!authState.hasLocalUserData || !authState.hasSessionUserData ||
               !authState.hasLocalUserId || !authState.hasSessionUserId) {
      const fixed = AuthUtils.fixSessionStorage();
      console.log('Fixed session storage:', fixed);
    }
    
    // Check WebRTC support
    console.log('WebRTC supported:', !!window.RTCPeerConnection);
    
    // Check media permissions
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        console.log('Video devices:', videoDevices.length);
        console.log('Audio devices:', audioDevices.length);
      })
      .catch(err => console.error('Error checking media devices:', err));
    
    console.groupEnd();
    
    return "Debug info logged to console";
  };
  
  // Add a helper function to set debug session data
  window.setDebugSession = (userData, userId) => {
    if (!userData || !userId) {
      console.error('Please provide both userData and userId');
      return false;
    }
    
    // Generate a random session ID if needed
    const sessionId = 'debug_' + Math.random().toString(36).substring(2, 15);
    
    // Set the session data
    return AuthUtils.setDebugSessionData(userData, userId, sessionId);
  };
  
  console.log('Video call debugging utilities available. Type window.debugVideoCall() to run diagnostics.');
} 