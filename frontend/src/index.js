// Import polyfills first
import './setupPolyfills';
import './setupAxios'; // Import axios configuration

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
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