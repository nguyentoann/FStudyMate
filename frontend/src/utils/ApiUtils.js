import { API_URL } from '../services/config';

// Debug flag to control logging - set to false to disable verbose logs
// Change to true when troubleshooting CORS or API issues
const DEBUG_LOGGING = false;
const MAX_RETRY_ATTEMPTS = 1; // Maximum retry attempts for failed API calls

/**
 * Makes an API call with proper error handling, authentication, and CORS fallbacks
 * @param {string} url - The API endpoint (without base URL)
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} body - Request body (optional)
 * @param {object} headers - Additional headers (optional)
 * @param {boolean} withCredentials - Whether to include credentials (default: true)
 * @returns {Promise<Response>} - Fetch response promise
 */
export const makeApiCall = async (url, method, body, headers = {}, withCredentials = true) => {
  // Add logging for API calls
  if (DEBUG_LOGGING) {
    console.log(`[API] Making ${method} request to ${url}`);
  }

  // Prepare headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Merge default headers with custom headers
  const mergedHeaders = { ...defaultHeaders, ...headers };

  // Get authentication method (session-based)
  const authMethod = getAuthMethod();
  if (DEBUG_LOGGING) {
    console.log(`[API] Using auth method: ${authMethod || 'none'}`);
  }

  // Build request options
  let options = {
    method: method,
    headers: mergedHeaders,
    body: body ? JSON.stringify(body) : undefined
  };

  // Use credentials by default for session-based auth
  if (withCredentials) {
    options.credentials = 'include';
  }

  let retryCount = 0;

  try {
    // First attempt with credentials if requested
    if (withCredentials) {
      if (DEBUG_LOGGING) {
        console.log(`[API] Attempting request with credentials`);
      }
      const response = await fetch(`${API_URL}${url}`, options);
      
      // If successful, return response
      if (response.ok) {
        if (DEBUG_LOGGING) {
          console.log(`[API] Request succeeded with status: ${response.status}`);
        }
        return response;
      }
      
      // If unauthorized or forbidden, don't retry
      if (response.status === 401 || response.status === 403) {
        if (DEBUG_LOGGING) {
          console.log(`[API] Request failed with status: ${response.status}, not retrying`);
        }
        return response;
        }
      
      // If CORS issues, try without credentials (but only once)
      if (DEBUG_LOGGING && retryCount < MAX_RETRY_ATTEMPTS) {
        console.log(`[API] Request failed with status: ${response.status}, trying without credentials (retry ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
        retryCount++;
      } else if (retryCount >= MAX_RETRY_ATTEMPTS) {
      if (DEBUG_LOGGING) {
          console.log(`[API] Max retry attempts (${MAX_RETRY_ATTEMPTS}) reached, returning last response`);
        }
        return response;
      }
    }
    
    // Only proceed with fallback if we haven't reached the retry limit
    if (retryCount < MAX_RETRY_ATTEMPTS) {
    // Fall back to request without credentials
    options.credentials = 'omit';
    if (DEBUG_LOGGING) {
      console.log(`[API] Attempting request without credentials`);
    }
    const fallbackResponse = await fetch(`${API_URL}${url}`, options);
    
    if (DEBUG_LOGGING) {
      console.log(`[API] Fallback request status: ${fallbackResponse.status}`);
    }
    
    // Log warning if fallback succeeded but original failed
    if (fallbackResponse.ok && withCredentials && DEBUG_LOGGING) {
      console.warn(`[API] Request succeeded without credentials but failed with credentials. This may indicate a CORS configuration issue.`);
    }
    
    return fallbackResponse;
    }
    
  } catch (error) {
    // Handle network errors
    if (DEBUG_LOGGING) {
      console.error(`[API] Network error calling ${url}:`, error);
    }
    
    // If it's likely a CORS error, try one more time without credentials (but only if we haven't reached the retry limit)
    if (withCredentials && 
        (error.message.includes('CORS') || error.message.includes('Failed to fetch')) &&
        retryCount < MAX_RETRY_ATTEMPTS) {
      if (DEBUG_LOGGING) {
        console.log(`[API] CORS issue detected, trying final attempt without credentials (retry ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
      }
      
      retryCount++;
      
      try {
        options.credentials = 'omit';
        return await fetch(`${API_URL}${url}`, options);
      } catch (fallbackError) {
        if (DEBUG_LOGGING) {
          console.error(`[API] Fallback request also failed:`, fallbackError);
        }
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