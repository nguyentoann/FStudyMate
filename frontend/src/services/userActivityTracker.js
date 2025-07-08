import axios from 'axios';
import { API_URL } from './config';
import { getDeviceInfo } from './deviceDetector';

// Session tracking object
const session = {
  startTime: new Date(),
  lastActivity: new Date(),
  pageViews: 0,
  events: [],
  currentPage: window.location.pathname,
  device: getDeviceInfo(),
  ipAddress: null
};

// Get IP address on initialization
const fetchIPAddress = async () => {
  try {
    // External API call - withCredentials should be false
    const response = await axios.get('https://api.ipify.org?format=json');
    session.ipAddress = response.data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    session.ipAddress = 'Unknown';
  }
};

// Initialize session tracking
const initActivityTracking = (user) => {
  fetchIPAddress();
  
  // Track page changes
  const originalPushState = window.history.pushState;
  window.history.pushState = function(state, title, url) {
    originalPushState.apply(this, [state, title, url]);
    trackPageView(url);
  };
  
  // Track browser back/forward buttons
  window.addEventListener('popstate', () => {
    trackPageView(window.location.pathname);
  });
  
  // Track user activity
  ['click', 'keypress', 'scroll', 'mousemove'].forEach(eventType => {
    document.addEventListener(eventType, throttle(() => {
      updateLastActivity();
    }, 60000)); // Only update once per minute to avoid too many updates
  });
  
  // Send heartbeat every minute to keep session active
  setInterval(() => {
    sendActivityUpdate();
  }, 60000);
  
  // Initial page view
  trackPageView(window.location.pathname);
  
  // Send data when user is about to leave
  window.addEventListener('beforeunload', () => {
    sendActivityUpdate(true);
  });
  
  // Log the session start
  console.log('User activity tracking initialized', session);
};

// Track page view
const trackPageView = (url) => {
  session.pageViews++;
  session.currentPage = url;
  session.events.push({
    type: 'pageView',
    timestamp: new Date(),
    url
  });
  updateLastActivity();
};

// Track specific events (quiz attempt, answer submission, etc)
const trackEvent = (eventType, eventData) => {
  session.events.push({
    type: eventType,
    timestamp: new Date(),
    data: eventData
  });
  updateLastActivity();
};

// Update last activity timestamp
const updateLastActivity = () => {
  session.lastActivity = new Date();
};

// Get session duration in minutes
const getSessionDuration = () => {
  const now = new Date();
  return Math.floor((now - session.startTime) / 60000);
};

// Send activity update to server
const sendActivityUpdate = async (isFinal = false) => {
  try {
    // Get session token from localStorage - ensure it's not empty
    const sessionToken = localStorage.getItem('sessionId') || generateTemporaryToken();
    
    // Get user ID if available
    const userId = localStorage.getItem('userId');
    
    // Debug what we're sending
    console.log('Activity tracking data before send:', {
      sessionToken,
      userId: userId || 'guest',
      username: localStorage.getItem('username') || 'guest',
      currentPage: session.currentPage,
      pageViews: session.pageViews,
      ipAddress: session.ipAddress
    });
    
    const activityData = {
      userId: userId ? parseInt(userId, 10) : null, // Ensure userId is numeric if present
      username: localStorage.getItem('username') || 'guest',
      sessionToken: sessionToken,  // Add session token here
      duration: getSessionDuration(),
      lastActivity: session.lastActivity.toISOString(),
      currentPage: session.currentPage,
      pageViews: session.pageViews,
      device: session.device,
      ipAddress: session.ipAddress,
      isFinal
    };
    
    // Send recent events only (to keep payload size reasonable)
    if (session.events.length > 0) {
      activityData.events = session.events.slice(-10); // Last 10 events only
      
      // Clear events that were sent
      if (isFinal) {
        session.events = [];
      } else {
        // Keep very recent events
        session.events = session.events.slice(-3);
      }
    }
    
    // In a real app, send this data to your backend
    const response = await axios.post(`${API_URL}/user-activity`, activityData);
    console.log('Activity data sent to server', activityData);
    console.log('Server response:', response.data);
    
    // Store the session ID returned by the server if available
    if (response.data && response.data.sessionId) {
      console.log(`Server assigned session ID: ${response.data.sessionId}`);
    }
    
  } catch (error) {
    console.error('Failed to send activity data:', error);
    if (error.response) {
      console.error('Server response:', error.response.status, error.response.data);
    }
  }
};

// Generate a temporary session token if none exists
const generateTemporaryToken = () => {
  const token = 'temp_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('sessionId', token);
  return token;
};

// Utility: Throttle function to limit execution frequency
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export {
  initActivityTracking,
  trackEvent,
  trackPageView,
  getSessionDuration,
  session
}; 