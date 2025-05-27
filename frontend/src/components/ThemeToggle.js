import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  // Add console logs to debug
  console.log("Theme toggle rendered, darkMode:", darkMode);
  
  const handleToggle = () => {
    console.log("Toggle clicked, current darkMode:", darkMode);
    toggleDarkMode();
    console.log("After toggle, darkMode should be:", !darkMode);
  };
  
  return (
    <button
      onClick={handleToggle}
      className={`fixed bottom-4 right-20 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 shadow-lg ${
        darkMode 
          ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      }`}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle; 