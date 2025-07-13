import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const InactivityWarning = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds countdown
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // Configuration - can be adjusted for testing
  const WARNING_DELAY = process.env.NODE_ENV === 'development' 
    ? 5 * 60 * 1000  // 5 minutes for development testing
    : 4 * 60 * 1000; // 4 minutes in milliseconds for production
  const LOGOUT_DELAY = 5 * 60 * 1000; // 5 minutes in milliseconds
  const COUNTDOWN_DURATION = 60; // 60 seconds countdown
  
  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
    setTimeLeft(COUNTDOWN_DURATION);
  }, []);
  
  // Handle user activity events
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity]);
  
  // Check for inactivity and show warning
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      if (timeSinceLastActivity >= WARNING_DELAY && !showWarning) {
        console.log(`Inactivity warning triggered after ${timeSinceLastActivity / 1000} seconds`);
        setShowWarning(true);
        setTimeLeft(COUNTDOWN_DURATION);
      }
    };
    
    const inactivityCheck = setInterval(checkInactivity, 1000); // Check every second
    
    return () => clearInterval(inactivityCheck);
  }, [lastActivity, showWarning, WARNING_DELAY]);
  
  // Handle countdown when warning is shown
  useEffect(() => {
    let countdownInterval;
    
    if (showWarning) {
      countdownInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - logout user
            console.log('Inactivity timeout reached, logging out user');
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [showWarning]);
  
  // Handle logout
  const handleLogout = () => {
    console.log('Logging out due to inactivity');
    logout();
    navigate('/login');
    
    // Show session expired notification
    if (window.showSessionExpiredNotification) {
      window.showSessionExpiredNotification();
    }
  };
  
  // Handle "I'm still here" button
  const handleStayActive = () => {
    console.log('User clicked "I\'m still here", extending session');
    updateActivity();
  };
  
  if (!showWarning) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-orange-300 rounded-lg shadow-lg p-4 z-50 max-w-sm animate-fadeIn">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900">
            Are you still there?
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            You will be logged out due to inactivity in {timeLeft} second{timeLeft !== 1 ? 's' : ''}.
          </p>
          
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleStayActive}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              I'm still here
            </button>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Logout now
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setShowWarning(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
        <div 
          className="bg-orange-500 h-1 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / COUNTDOWN_DURATION) * 100}%` }}
        />
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500">
          Debug: Warning delay = {WARNING_DELAY / 1000}s
        </div>
      )}
    </div>
  );
};

export default InactivityWarning; 