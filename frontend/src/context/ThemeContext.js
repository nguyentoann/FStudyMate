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

  // Initialize background image state
  const [backgroundImage, setBackgroundImage] = useState(() => {
    try {
      const savedBgImage = localStorage.getItem('appBackgroundImage');
      return savedBgImage || '';
    } catch (error) {
      console.error("Error initializing background image:", error);
      return '';
    }
  });

  // Initialize opacity state (default: 50%)
  const [backgroundOpacity, setBackgroundOpacity] = useState(() => {
    try {
      const savedOpacity = localStorage.getItem('appBackgroundOpacity');
      return savedOpacity !== null ? parseInt(savedOpacity, 10) : 50;
    } catch (error) {
      console.error("Error initializing background opacity:", error);
      return 50;
    }
  });

  // Initialize component opacity state (default: 90%)
  const [componentOpacity, setComponentOpacity] = useState(() => {
    try {
      const savedComponentOpacity = localStorage.getItem('appComponentOpacity');
      return savedComponentOpacity !== null ? parseInt(savedComponentOpacity, 10) : 90;
    } catch (error) {
      console.error("Error initializing component opacity:", error);
      return 90;
    }
  });

  // Initialize component blur level state (default: 5px)
  const [blurLevel, setBlurLevel] = useState(() => {
    try {
      const savedBlurLevel = localStorage.getItem('appBlurLevel');
      return savedBlurLevel !== null ? parseInt(savedBlurLevel, 10) : 5;
    } catch (error) {
      console.error("Error initializing blur level:", error);
      return 5;
    }
  });

  // Initialize blur type state (default: 'blur' - standard Gaussian blur)
  const [blurType, setBlurType] = useState(() => {
    try {
      const savedBlurType = localStorage.getItem('appBlurType');
      return savedBlurType || 'blur';
    } catch (error) {
      console.error("Error initializing blur type:", error);
      return 'blur';
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

  // Apply background image and opacity
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem('appBackgroundImage', backgroundImage);
      localStorage.setItem('appBackgroundOpacity', backgroundOpacity.toString());

      // Apply background styles
      const bodyElement = document.body;
      
      // Create a style block for the background
      let styleElement = document.getElementById('custom-background-style');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-background-style';
        document.head.appendChild(styleElement);
      }

      // If we have a background image, set it with opacity
      if (backgroundImage) {
        // Create an opacity value as decimal (0-1)
        const opacityValue = backgroundOpacity / 100;
        
        // Set the style with pseudo element to control opacity
        styleElement.textContent = `
          body {
            position: relative;
          }
          
          body::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background-image: url(${backgroundImage});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: ${opacityValue};
            pointer-events: none;
          }
          
          /* Ensure the main container has a relative position */
          #root, #app, .app-container, main {
            position: relative;
            z-index: 1;
          }
        `;
      } else {
        // Remove background image styles if no image is set
        styleElement.textContent = '';
      }

      console.log("Background updated successfully:", backgroundImage ? "custom" : "none");
    } catch (error) {
      console.error("Error applying background:", error);
    }
  }, [backgroundImage, backgroundOpacity]);

  // Apply component opacity
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem('appComponentOpacity', componentOpacity.toString());
      localStorage.setItem('appBlurLevel', blurLevel.toString());
      localStorage.setItem('appBlurType', blurType);

      // Create a style block for component opacity
      let componentStyleElement = document.getElementById('custom-component-style');
      if (!componentStyleElement) {
        componentStyleElement = document.createElement('style');
        componentStyleElement.id = 'custom-component-style';
        document.head.appendChild(componentStyleElement);
      }

      // Calculate opacity value
      const opacityValue = componentOpacity / 100;
      
      // Determine blur filter based on type
      let blurFilter = '';
      switch(blurType) {
        case 'blur':
          blurFilter = `blur(${blurLevel}px)`;
          break;
        case 'motion':
          blurFilter = `blur(${Math.max(1, blurLevel/2)}px) brightness(1.05)`;
          break;
        case 'radial':
          blurFilter = `blur(${blurLevel}px) brightness(1.02) contrast(1.05)`;
          break;
        case 'lens':
          blurFilter = `blur(${blurLevel}px) saturate(1.1) brightness(1.05)`;
          break;
        default:
          blurFilter = `blur(${blurLevel}px)`;
      }
      
      // Apply the opacity to specific elements more selectively
      componentStyleElement.textContent = `
        /* Apply to content cards and panels */
        .bg-white:not(nav):not(.navbar):not(header),
        .bg-gray-50:not(nav):not(.navbar):not(header),
        .bg-gray-100:not(nav):not(.navbar):not(header),
        .card:not(nav):not(.navbar):not(header),
        .rounded-lg.shadow-md:not(nav):not(.navbar):not(header),
        .rounded-lg.shadow-lg:not(nav):not(.navbar):not(header),
        .rounded-lg.shadow-xl:not(nav):not(.navbar):not(header),
        .rounded-md.shadow-md:not(nav):not(.navbar):not(header) {
          background-color: rgba(255, 255, 255, ${opacityValue}) !important;
          backdrop-filter: ${blurFilter};
        }

        /* Apply to dark themed components with the same rule */
        .dark .bg-gray-800:not(nav):not(.navbar):not(header),
        .dark .bg-gray-900:not(nav):not(.navbar):not(header) {
          background-color: rgba(31, 41, 55, ${opacityValue}) !important;
          backdrop-filter: ${blurFilter};
        }
        
        /* Special rule for top navigation elements only */
        header, .navbar:not(.sidebar), nav.top-nav {
          position: relative;
          z-index: 10;
          background-color: rgba(var(--navbar-bg-color, 79, 70, 229), 0.9) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        /* Fix for sidebar - keep it white */
        .sidebar, aside, #sidebar, .side-nav, [class*="menu"] {
          background-color: #ffffff !important;
        }
        
        /* Add a CSS variable to store the navbar color if not already present */
        :root {
          --navbar-bg-color: 79, 70, 229; /* Default indigo color for navbar */
        }
      `;

      console.log("Component opacity updated successfully:", componentOpacity + "%");
      console.log("Blur level updated successfully:", blurLevel + "px");
      console.log("Blur type updated successfully:", blurType);
    } catch (error) {
      console.error("Error applying component opacity:", error);
    }
  }, [componentOpacity, blurLevel, blurType]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    console.log("Toggle function called");
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      console.log("Toggling dark mode from", prevMode, "to", newMode);
      return newMode;
    });
  };

  // Update background image
  const updateBackgroundImage = (imageUrl) => {
    setBackgroundImage(imageUrl);
  };

  // Update background opacity
  const updateBackgroundOpacity = (opacity) => {
    setBackgroundOpacity(opacity);
  };

  // Update component opacity
  const updateComponentOpacity = (opacity) => {
    setComponentOpacity(opacity);
  };

  // Update blur level
  const updateBlurLevel = (level) => {
    setBlurLevel(level);
  };

  // Update blur type
  const updateBlurType = (type) => {
    setBlurType(type);
  };

  console.log("ThemeProvider rendering with darkMode:", darkMode);

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode,
      backgroundImage,
      backgroundOpacity,
      updateBackgroundImage,
      updateBackgroundOpacity,
      componentOpacity,
      updateComponentOpacity,
      blurLevel,
      updateBlurLevel,
      blurType,
      updateBlurType
    }}>
      {children}
    </ThemeContext.Provider>
  );
}; 