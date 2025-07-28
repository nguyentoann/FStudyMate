import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitialCapturedPath, clearLastVisitedPath, clearInitialCapturedPath } from '../utils/NavigationUtils';
import { formatDistanceToNow } from 'date-fns';

const LastLocationNotification = () => {
  const [show, setShow] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay to ensure routing has completed
    const timer = setTimeout(() => {
      // Get the captured path from the initial app load
      const capturedLocation = getInitialCapturedPath();
      
      if (capturedLocation) {
        // Get path name only (remove query params, etc.)
        const pathOnly = capturedLocation.path.split('?')[0];
        
        // Don't show notification if we're already on the saved path
        if (window.location.pathname !== pathOnly) {
          setLastLocation(capturedLocation);
          setShow(true);
          
          // Auto hide after 15 seconds
          const hideTimer = setTimeout(() => {
            setShow(false);
          }, 15000);
          
          return () => clearTimeout(hideTimer);
        } else {
          // Clear the captured path if we're already on that page
          clearInitialCapturedPath();
        }
      }
    }, 500); // Short delay to ensure routing has completed
    
    return () => clearTimeout(timer);
  }, []);

  const handleGoToLastLocation = () => {
    navigate(lastLocation.path);
    setShow(false);
    clearInitialCapturedPath();
  };

  const handleDismiss = () => {
    setShow(false);
    clearLastVisitedPath();
    clearInitialCapturedPath();
  };

  if (!show || !lastLocation) return null;

  // Format the time difference
  let timeAgo;
  try {
    timeAgo = formatDistanceToNow(new Date(lastLocation.timestamp), { addSuffix: true });
  } catch (error) {
    timeAgo = 'recently';
  }

  // Format the path for display (remove leading slash, capitalize words)
  const formatPathForDisplay = (path) => {
    // Remove leading slash and split by additional slashes
    const parts = path.replace(/^\//, '').split('/');
    
    // If empty (was just "/"), use "home page"
    if (parts.length === 1 && !parts[0]) {
      return 'home page';
    }
    
    // Format the path parts
    return parts
      .map(part => {
        // Replace dashes/underscores with spaces and capitalize each word
        return part
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, letter => letter.toUpperCase());
      })
      .join(' › ');
  };

  const displayPath = formatPathForDisplay(lastLocation.path);

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Return to previous location?
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You visited <span className="font-medium">{displayPath}</span> {timeAgo}
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleGoToLastLocation}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go back
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Skip
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close</span>
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LastLocationNotification; 