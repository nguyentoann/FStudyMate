/**
 * Utility functions for handling navigation state
 */

// Session identifier
let SESSION_ID = null;
// Store initial path for comparison
let INITIAL_SAVED_PATH = null;
// Flag to track if we're in delay period
let SAVE_PATH_TIMEOUT = null;

// Initialize session
const initSession = () => {
  if (!SESSION_ID) {
    SESSION_ID = 'session_' + Date.now();
    sessionStorage.setItem('current_session_id', SESSION_ID);
  }
  return SESSION_ID;
};

// Get current session ID
const getSessionId = () => {
  if (!SESSION_ID) {
    SESSION_ID = sessionStorage.getItem('current_session_id') || initSession();
  }
  return SESSION_ID;
};

/**
 * Check if we're currently in a save-delay period
 * @returns {boolean} True if a save is currently delayed
 */
export const isSaveDelayed = () => {
  return SAVE_PATH_TIMEOUT !== null;
};

/**
 * Clear any pending save path timeouts
 */
export const clearSavePathTimeout = () => {
  if (SAVE_PATH_TIMEOUT) {
    clearTimeout(SAVE_PATH_TIMEOUT);
    SAVE_PATH_TIMEOUT = null;
  }
};

/**
 * Schedule saving the path with a delay
 * @param {string} path - The current path to save
 * @param {number} delayMs - Delay in milliseconds
 * @param {Function} callback - Optional callback when save completes
 */
export const schedulePathSave = (path, delayMs = 5000, callback) => {
  // Clear any existing timeout
  clearSavePathTimeout();
  
  // Set new timeout
  SAVE_PATH_TIMEOUT = setTimeout(() => {
    saveLastVisitedPath(path, true);
    SAVE_PATH_TIMEOUT = null;
    if (callback) callback();
  }, delayMs);
  
  // For debugging
  console.log(`Path save scheduled for '${path}' with ${delayMs}ms delay`);
};

/**
 * Capture the initial saved path before it gets updated
 * This must be called as early as possible during app initialization
 * @returns {object|null} The captured path data or null
 */
export const captureInitialSavedPath = () => {
  if (INITIAL_SAVED_PATH === null) {
    const path = localStorage.getItem('lastVisitedPath');
    const timestamp = localStorage.getItem('lastVisitedTime');
    
    if (path && timestamp) {
      INITIAL_SAVED_PATH = { path, timestamp };
      // Generate a new session ID to ensure separation
      initSession();
      return INITIAL_SAVED_PATH;
    }
  }
  return INITIAL_SAVED_PATH;
};

/**
 * Get the initial captured path for comparison
 * @returns {object|null} The captured initial path or null
 */
export const getInitialCapturedPath = () => {
  return INITIAL_SAVED_PATH;
};

/**
 * Clear the captured initial path
 */
export const clearInitialCapturedPath = () => {
  INITIAL_SAVED_PATH = null;
};

/**
 * Save the current path to localStorage
 * @param {string} path - The current path to save
 * @param {boolean} bypassCheck - If true, bypasses the delay check
 */
export const saveLastVisitedPath = (path, bypassCheck = false) => {
  // Don't save if we're in a delay period unless bypass is true
  if (!bypassCheck && isSaveDelayed()) {
    console.log(`Path save for '${path}' skipped - in delay period`);
    return;
  }

  // Don't save login, register or other auth related pages
  const excludedPaths = [
    '/login', 
    '/register', 
    '/forgot-password', 
    '/reset-password', 
    '/verify-otp'
  ];
  
  if (!excludedPaths.includes(path)) {
    // Save with current session ID
    const sessionId = getSessionId();
    localStorage.setItem('lastVisitedPath', path);
    localStorage.setItem('lastVisitedTime', new Date().toISOString());
    localStorage.setItem('lastVisitedSession', sessionId);
    console.log(`Path '${path}' saved successfully`);
  }
};

/**
 * Get the last visited path from localStorage
 * @returns {object|null} - Object containing path and timestamp, or null if not found or from same session
 */
export const getLastVisitedPath = () => {
  const path = localStorage.getItem('lastVisitedPath');
  const timestamp = localStorage.getItem('lastVisitedTime');
  const lastSession = localStorage.getItem('lastVisitedSession');
  const currentSession = getSessionId();
  
  // Only return if there's a path and it's from a previous session
  if (path && timestamp && lastSession !== currentSession) {
    return { path, timestamp };
  }
  
  return null;
};

/**
 * Clear the saved last visited path
 */
export const clearLastVisitedPath = () => {
  localStorage.removeItem('lastVisitedPath');
  localStorage.removeItem('lastVisitedTime');
  localStorage.removeItem('lastVisitedSession');
}; 