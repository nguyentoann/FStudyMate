/**
 * Utility functions for authentication and session management
 */

/**
 * Inspects the authentication state and logs detailed information
 */
export const inspectAuthState = () => {
  console.group('[AUTH] Authentication State Inspection');
  
  // Check user data in localStorage and sessionStorage
  const localUserData = localStorage.getItem('user');
  const sessionUserData = sessionStorage.getItem('user');
  
  const localUserId = localStorage.getItem('userId');
  const sessionUserId = sessionStorage.getItem('userId');
  
  const localSessionId = localStorage.getItem('sessionId');
  const sessionSessionId = sessionStorage.getItem('sessionId');
  
  console.log('localStorage user data:', localUserData ? 'Present' : 'Missing');
  console.log('sessionStorage user data:', sessionUserData ? 'Present' : 'Missing');
  
  console.log('localStorage userId:', localUserId || 'Missing');
  console.log('sessionStorage userId:', sessionUserId || 'Missing');
  
  console.log('localStorage sessionId:', localSessionId ? 'Present' : 'Missing');
  console.log('sessionStorage sessionId:', sessionSessionId ? 'Present' : 'Missing');
  
  // Parse and display user object if available
  try {
    if (sessionUserData) {
      const userData = JSON.parse(sessionUserData);
      console.log('User data contents:', userData);
    }
  } catch (error) {
    console.log('Error parsing user data:', error);
  }
  
  console.groupEnd();
  
  return {
    hasLocalUserData: !!localUserData,
    hasSessionUserData: !!sessionUserData,
    hasLocalUserId: !!localUserId,
    hasSessionUserId: !!sessionUserId,
    hasLocalSessionId: !!localSessionId,
    hasSessionSessionId: !!sessionSessionId,
    userData: sessionUserData || localUserData || null
  };
};

/**
 * Fixes common session storage issues
 * @returns {boolean} True if fixes were applied
 */
export const fixSessionStorage = () => {
  let fixed = false;
  
  // Check if user data exists in one storage but not the other
  const localUserData = localStorage.getItem('user');
  const sessionUserData = sessionStorage.getItem('user');
  
  // If user data exists in localStorage but not sessionStorage
  if (localUserData && !sessionUserData) {
    sessionStorage.setItem('user', localUserData);
    console.log('[AUTH] Copied user data from localStorage to sessionStorage');
    fixed = true;
  }
  
  // If user data exists in sessionStorage but not localStorage
  if (!localUserData && sessionUserData) {
    localStorage.setItem('user', sessionUserData);
    console.log('[AUTH] Copied user data from sessionStorage to localStorage');
    fixed = true;
  }
  
  // Do the same for userId
  const localUserId = localStorage.getItem('userId');
  const sessionUserId = sessionStorage.getItem('userId');
  
  if (localUserId && !sessionUserId) {
    sessionStorage.setItem('userId', localUserId);
    console.log('[AUTH] Copied userId from localStorage to sessionStorage');
    fixed = true;
  }
  
  if (!localUserId && sessionUserId) {
    localStorage.setItem('userId', sessionUserId);
    console.log('[AUTH] Copied userId from sessionStorage to localStorage');
    fixed = true;
  }
  
  // And for sessionId
  const localSessionId = localStorage.getItem('sessionId');
  const sessionSessionId = sessionStorage.getItem('sessionId');
  
  if (localSessionId && !sessionSessionId) {
    sessionStorage.setItem('sessionId', localSessionId);
    console.log('[AUTH] Copied sessionId from localStorage to sessionStorage');
    fixed = true;
  }
  
  if (!localSessionId && sessionSessionId) {
    localStorage.setItem('sessionId', sessionSessionId);
    console.log('[AUTH] Copied sessionId from sessionStorage to localStorage');
    fixed = true;
  }
  
  return fixed;
};

/**
 * Manually sets debug session data for testing
 * @param {Object} userData User data object
 * @param {string} userId User ID
 * @param {string} sessionId Session ID
 */
export const setDebugSessionData = (userData, userId, sessionId) => {
  if (!userData || !userId) {
    console.error('[AUTH] Missing required parameters for setDebugSessionData');
    return false;
  }
  
  const userDataStr = typeof userData === 'string' ? userData : JSON.stringify(userData);
  
  localStorage.setItem('user', userDataStr);
  sessionStorage.setItem('user', userDataStr);
  
  localStorage.setItem('userId', String(userId));
  sessionStorage.setItem('userId', String(userId));
  
  if (sessionId) {
    localStorage.setItem('sessionId', sessionId);
    sessionStorage.setItem('sessionId', sessionId);
  }
  
  console.log('[AUTH] Debug session data set in both localStorage and sessionStorage');
  return true;
};

/**
 * Check if session data is valid
 * @returns {boolean} True if required session data exists
 */
export const isValidSession = () => {
  const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  
  return !!userData && !!userId;
};

// For backward compatibility
export const fixTokenStorage = fixSessionStorage;
export const isValidToken = isValidSession;

export default {
  inspectAuthState,
  fixSessionStorage,
  fixTokenStorage, // alias for backward compatibility
  setDebugSessionData,
  isValidSession,
  isValidToken // alias for backward compatibility
}; 