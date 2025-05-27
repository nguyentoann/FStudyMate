import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL, OPEN_URL, EMERGENCY_URL } from '../services/config';
import { initActivityTracking, trackEvent } from '../services/userActivityTracker';
import { v4 as uuidv4 } from 'uuid';

// Add API emergency URL
const API_EMERGENCY_URL = `${API_URL}/emergency`;

// Remove the hardcoded API_URL constant
// const API_URL = 'http://localhost:8080/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user');
    
    // Generate or retrieve session ID
    let currentSessionId = localStorage.getItem('sessionId');
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      localStorage.setItem('sessionId', currentSessionId);
    }
    setSessionId(currentSessionId);
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Initialize activity tracking for logged-in users
      setTimeout(() => {
        initActivityTracking(userData);
      }, 1000);
    }
    
    setLoading(false);
  }, []);

  const login = async (loginIdentifier, password) => {
    try {
      console.log('Attempting login with:', loginIdentifier);
      
      // Create request body with appropriate field based on whether it looks like an email
      const requestBody = {};
      
      // Check if loginIdentifier is an email (contains @ sign)
      if (loginIdentifier.includes('@')) {
        requestBody.email = loginIdentifier;
      } else {
        requestBody.username = loginIdentifier;
      }
      
      requestBody.password = password;
      
      // Use the open endpoint that doesn't require auth
      const response = await fetch(`${OPEN_URL}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        credentials: 'omit' // Must match server configuration
      });

      console.log('Login response status:', response.status);
      
      // Parse the response data first
      const data = await response.json();
      console.log('Login response data:', data);
      
      // Check for unverified account status
      if (data.status === 'unverified') {
        console.log('Unverified account detected:', data);
        
        // Track failed login due to unverified account
        trackEvent('login_failed', {
          username: loginIdentifier,
          reason: 'account_unverified'
        });
        
        // Return special response indicating verification needed
        return {
          requiresVerification: true,
          email: data.email,
          message: data.message || 'Your account needs verification'
        };
      }
      
      // Check both the HTTP status and the response data for regular errors
      if (!response.ok || data.status === 'error') {
        const errorMessage = data.message || 'Login failed';
        console.error('Login failed:', errorMessage);
        
        // Track failed login attempt
        trackEvent('login_failed', {
          username: loginIdentifier,
          reason: errorMessage
        });
        
        throw new Error(errorMessage);
      }

      // Success - store user data
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      // Store userId for activity tracking
      localStorage.setItem('userId', data.id);
      localStorage.setItem('username', data.username || loginIdentifier);
      
      // Track successful login
      trackEvent('login_success', {
        userId: data.id,
        username: data.username || loginIdentifier
      });
      
      // Initialize user activity tracking
      initActivityTracking(data);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const updateUser = (userData) => {
    // Update user state with new data
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Track user profile update
    trackEvent('user_updated', {
      userId: updatedUser.id,
      updatedFields: Object.keys(userData)
    });
    
    return updatedUser;
  };

  const logout = () => {
    // Track logout event before clearing user data
    if (user) {
      trackEvent('logout', {
        userId: user.id,
        username: user.username
      });
    }
    
    setUser(null);
    localStorage.removeItem('user');
    
    // Keep sessionId but clear userId for anonymous tracking
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  };

  const register = async (userData) => {
    try {
      console.log('Registration data being sent:', userData);
      
      // Switch back to the emergency endpoint that was working previously
      const response = await fetch(`${EMERGENCY_URL}/auth`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'omit' // Set back to 'omit' to avoid CORS issues
      });

      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Registration failed with status: ${response.status}`;
        try {
          // Try to parse error JSON if it exists
          const errorData = await response.json();
          console.error('Registration server error:', errorData);
          errorMessage = errorData.error || errorMessage;
          
          // Track registration failure
          trackEvent('registration_failed', {
            email: userData.email,
            reason: errorMessage
          });
        } catch (jsonError) {
          // If JSON parsing fails, use status code message
          console.error('Failed to parse error response:', jsonError);
        }
        throw new Error(errorMessage);
      }

      try {
        const responseData = await response.json();
        console.log('Registration successful, response:', responseData);
        
        // Track successful registration
        trackEvent('registration_success', {
          email: userData.email
        });
        
        // Return the full response data
        return responseData;
      } catch (jsonError) {
        console.error('Failed to parse success response:', jsonError);
        // Return a minimal response object if we can't parse the response
        return { 
          requiresVerification: true,
          email: userData.email, 
          message: 'Registration successful but server returned invalid data' 
        };
      }
    } catch (error) {
      console.error('Registration error details:', error);
      throw error;
    }
  };

  // Add OTP verification method
  const verifyOtp = async (email, otp) => {
    try {
      console.log('Verifying OTP for email:', email);
      
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, otp }),
        credentials: 'include'
      });

      console.log('OTP verification response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `OTP verification failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('OTP verification server error:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('OTP verification successful:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  // Add method to resend OTP
  const resendOtp = async (email) => {
    try {
      console.log('Resending OTP for email:', email);
      
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      console.log('Resend OTP response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Resend OTP failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Resend OTP server error:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('OTP resent successfully:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser: updateUser, 
      login, 
      logout, 
      register,
      verifyOtp,
      resendOtp, 
      loading,
      sessionId 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 