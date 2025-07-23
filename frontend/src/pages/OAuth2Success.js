import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const OAuth2Success = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  
  useEffect(() => {
    // Automatically redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'
    }`}>
      <div className={`max-w-md w-full p-6 rounded-lg shadow-lg ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-2xl font-bold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>Google Login Disabled</h2>
        
        <p className={`mb-4 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Google login has been disabled for this application.
        </p>
        
        <p className={`mb-6 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          You will be redirected to the login page shortly.
        </p>
        
        <button 
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => navigate('/login')}
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

export default OAuth2Success; 