import { API_URL } from '../services/config';

/**
 * Makes an API call with proper error handling, authentication, and CORS fallbacks
 * @param {string} url - The API endpoint (without base URL)
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} body - Request body (optional)
 * @param {boolean} withCredentials - Whether to include credentials (default: true)
 * @returns {Promise<Response>} - Fetch response promise
 */
export const makeApiCall = async (url, method, body, withCredentials = true) => {
  // Add logging for API calls
  console.log(`[API] Making ${method} request to ${url}`);

  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
  };

  // Get authentication method (session-based)
  const authMethod = getAuthMethod();
  console.log(`[API] Using auth method: ${authMethod || 'none'}`);

  // Build request options
  let options = {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined
  };

  // Use credentials by default for session-based auth
  if (withCredentials) {
    options.credentials = 'include';
  }

  try {
    // First attempt with credentials if requested
    if (withCredentials) {
      console.log(`[API] Attempting request with credentials`);
      const response = await fetch(`${API_URL}${url}`, options);
      
      // If successful, return response
      if (response.ok) {
        console.log(`[API] Request succeeded with status: ${response.status}`);
        return response;
      }
      
      // If unauthorized, try token refresh logic if needed
      if (response.status === 401) {
        console.log(`[API] Unauthorized response - session may be expired`);
        // Could implement refresh logic here if needed
      }
      
      // If CORS issues, try without credentials
      console.log(`[API] Request failed with status: ${response.status}, trying without credentials`);
    }
    
    // Fall back to request without credentials
    options.credentials = 'omit';
    console.log(`[API] Attempting request without credentials`);
    const fallbackResponse = await fetch(`${API_URL}${url}`, options);
    
    console.log(`[API] Fallback request status: ${fallbackResponse.status}`);
    
    // Log warning if fallback succeeded but original failed
    if (fallbackResponse.ok && withCredentials) {
      console.warn(`[API] Request succeeded without credentials but failed with credentials. This may indicate a CORS configuration issue.`);
    }
    
    return fallbackResponse;
    
  } catch (error) {
    // Handle network errors
    console.error(`[API] Network error calling ${url}:`, error);
    
    // If it's likely a CORS error, try one more time without credentials
    if (withCredentials && 
        (error.message.includes('CORS') || error.message.includes('Failed to fetch'))) {
      console.log(`[API] CORS issue detected, trying final attempt without credentials`);
      
      try {
        options.credentials = 'omit';
        return await fetch(`${API_URL}${url}`, options);
      } catch (fallbackError) {
        console.error(`[API] Fallback request also failed:`, fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
};

/**
 * Determines the authentication method being used
 * @returns {string} Authentication method description
 */
export const getAuthMethod = () => {
  // Check for user data in session/localStorage
  const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
  const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
  const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
  
  if (sessionId) {
    return 'session-auth';
  } else if (userData && userId) {
    return 'user-data-auth';
  }
  
  return '';
};

export default {
  makeApiCall,
  getAuthMethod
}; 