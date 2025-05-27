import React, { createContext, useState, useEffect, useContext } from 'react';

// Create theme context
export const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize state from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    try {
      // Check localStorage for saved preference, default to light mode
      const savedTheme = localStorage.getItem('appDarkMode');
      console.log("Initial theme from localStorage:", savedTheme);
      
      if (savedTheme !== null) {
        return savedTheme === 'true';
      }
      
      // Default to light mode instead of checking system preference
      console.log("Setting default light mode");
      return false;
    } catch (error) {
      console.error("Error initializing theme:", error);
      return false;
    }
  });

  // Apply theme changes to document
  useEffect(() => {
    try {
      console.log("Applying theme changes, darkMode:", darkMode);
      
      // Save to localStorage
      localStorage.setItem('appDarkMode', darkMode.toString());
      
      // Handle HTML element for dark mode
      const htmlElement = document.documentElement;
      if (darkMode) {
        htmlElement.classList.add('dark', 'dark-mode');
      } else {
        htmlElement.classList.remove('dark', 'dark-mode');
      }
      
      // Handle body element for dark mode
      const bodyElement = document.body;
      if (darkMode) {
        bodyElement.classList.add('dark-mode');
        bodyElement.style.backgroundColor = '#0f172a';
        bodyElement.style.color = '#f1f5f9';
      } else {
        bodyElement.classList.remove('dark-mode');
        bodyElement.style.backgroundColor = '#f3f4f6';
        bodyElement.style.color = '#111827';
      }
      
      console.log("Theme updated successfully:", darkMode ? "dark" : "light");
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    console.log("Toggle function called");
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      console.log("Toggling dark mode from", prevMode, "to", newMode);
      return newMode;
    });
  };

  console.log("ThemeProvider rendering with darkMode:", darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}; 