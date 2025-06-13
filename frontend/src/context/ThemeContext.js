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

  // Initialize custom cursor state (default: true - enabled)
  const [customCursor, setCustomCursor] = useState(() => {
    try {
      const savedCustomCursor = localStorage.getItem('appCustomCursor');
      return savedCustomCursor !== null ? savedCustomCursor === 'true' : true;
    } catch (error) {
      console.error("Error initializing custom cursor:", error);
      return true;
    }
  });

  // Initialize liquid glass effect state (default: true - enabled)
  const [liquidGlassEffect, setLiquidGlassEffect] = useState(() => {
    try {
      const savedLiquidGlassEffect = localStorage.getItem('appLiquidGlassEffect');
      return savedLiquidGlassEffect !== null ? savedLiquidGlassEffect === 'true' : true;
    } catch (error) {
      console.error("Error initializing liquid glass effect:", error);
      return true;
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

  // Apply custom cursor
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem('appCustomCursor', customCursor.toString());

      // Create or get the custom cursor style element
      let cursorStyleElement = document.getElementById('custom-cursor-style');
      if (!cursorStyleElement) {
        cursorStyleElement = document.createElement('style');
        cursorStyleElement.id = 'custom-cursor-style';
        document.head.appendChild(cursorStyleElement);
      }

      // Apply custom cursor styles if enabled
      if (customCursor) {
        cursorStyleElement.textContent = `
          /* Base cursor for all elements */
          html, body, div, span, a, p, h1, h2, h3, h4, h5, h6, button, input, select, textarea {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="rgba(79, 70, 229, 0.5)" stroke="white" stroke-width="1.5"/></svg>') 8 8, auto !important;
          }
          
          /* Pointer cursor for interactive elements */
          a, button, [role="button"], [type="button"], [type="submit"], [type="reset"], label[for], select, summary, .cursor-pointer {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="rgba(79, 70, 229, 0.6)" stroke="white" stroke-width="1.5"/><circle cx="12" cy="12" r="2" fill="white"/></svg>') 12 12, pointer !important;
          }
          
          /* Text cursor for text inputs */
          input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"], input[type="number"], textarea {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24"><path d="M8,4 L8,20" stroke="white" stroke-width="2"/><path d="M8,4 L8,20" stroke="rgba(79, 70, 229, 0.7)" stroke-width="1"/></svg>') 8 12, text !important;
          }
        `;
      } else {
        // Remove custom cursor styles
        cursorStyleElement.textContent = '';
      }

      console.log("Custom cursor updated successfully:", customCursor ? "enabled" : "disabled");
    } catch (error) {
      console.error("Error applying custom cursor:", error);
    }
  }, [customCursor]);

  // Apply liquid glass effect
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem('appLiquidGlassEffect', liquidGlassEffect.toString());

      // Create or get the liquid glass script element
      let liquidGlassScriptElement = document.getElementById('liquid-glass-script');
      
      // If the effect is enabled and the script doesn't exist, create it
      if (liquidGlassEffect) {
        if (!liquidGlassScriptElement) {
          liquidGlassScriptElement = document.createElement('script');
          liquidGlassScriptElement.id = 'liquid-glass-script';
          document.body.appendChild(liquidGlassScriptElement);
        }

        // Set the script content
        liquidGlassScriptElement.textContent = `
          (function() {
            // Track mouse position
            let mouseX = 0;
            let mouseY = 0;
            
            // Update mouse position on move
            document.addEventListener('mousemove', function(e) {
              mouseX = e.clientX;
              mouseY = e.clientY;
              
              // Apply the effect to glass elements
              applyLiquidGlassBorderEffect();
            });
            
            // Apply effect on scroll too
            document.addEventListener('scroll', function() {
              applyLiquidGlassBorderEffect();
            });
            
            // Function to apply the liquid glass border effect
            function applyLiquidGlassBorderEffect() {
              // Target elements with backdrop-filter
              const glassElements = document.querySelectorAll('.bg-white:not(nav):not(.navbar):not(header), .bg-gray-50:not(nav):not(.navbar):not(header), .bg-gray-100:not(nav):not(.navbar):not(header), .card:not(nav):not(.navbar):not(header), .rounded-lg.shadow-md:not(nav):not(.navbar):not(header), .rounded-lg.shadow-lg:not(nav):not(.navbar):not(header), .rounded-lg.shadow-xl:not(nav):not(.navbar):not(header), .rounded-md.shadow-md:not(nav):not(.navbar):not(header), .dark .bg-gray-800:not(nav):not(.navbar):not(header), .dark .bg-gray-900:not(nav):not(.navbar):not(header)');
              
              glassElements.forEach(element => {
                // Get element position
                const rect = element.getBoundingClientRect();
                
                // Calculate nearest point on border to mouse
                // First determine which region the mouse is in relative to the element
                const isAbove = mouseY < rect.top;
                const isBelow = mouseY > rect.bottom;
                const isLeft = mouseX < rect.left;
                const isRight = mouseX > rect.right;
                
                // Calculate the nearest point on the border to the mouse
                let nearestX, nearestY;
                
                // X coordinate of nearest point
                if (isLeft) {
                  nearestX = rect.left;
                } else if (isRight) {
                  nearestX = rect.right;
                } else {
                  nearestX = mouseX;
                }
                
                // Y coordinate of nearest point
                if (isAbove) {
                  nearestY = rect.top;
                } else if (isBelow) {
                  nearestY = rect.bottom;
                } else {
                  nearestY = mouseY;
                }
                
                // Calculate distance from mouse to nearest point on border
                const distX = mouseX - nearestX;
                const distY = mouseY - nearestY;
                const distance = Math.sqrt(distX * distX + distY * distY);
                
                // Calculate max distance for effect
                const maxDistance = 100; // 100px max distance for effect
                
                // Calculate intensity based on distance (closer = more intense)
                const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
                const intensity = 1 - normalizedDistance; // 0 to 1 range
                
                // Only apply effect if the cursor is relatively close
                if (intensity > 0.1) {
                  // Create a gradient that's brightest at the nearest point
                  // Determine which side(s) the nearest point is on
                  const isOnTop = Math.abs(nearestY - rect.top) < 1;
                  const isOnRight = Math.abs(nearestX - rect.right) < 1;
                  const isOnBottom = Math.abs(nearestY - rect.bottom) < 1;
                  const isOnLeft = Math.abs(nearestX - rect.left) < 1;
                  
                  // Calculate the position of the nearest point as a percentage of the element's dimensions
                  const percentX = isOnLeft ? 0 : isOnRight ? 100 : ((nearestX - rect.left) / rect.width * 100);
                  const percentY = isOnTop ? 0 : isOnBottom ? 100 : ((nearestY - rect.top) / rect.height * 100);
                  
                  // Create a radial gradient that's brightest at the nearest point
                  let gradientPosition;
                  if (isOnTop) {
                    gradientPosition = \`\${percentX}% 0%\`;
                  } else if (isOnRight) {
                    gradientPosition = \`100% \${percentY}%\`;
                  } else if (isOnBottom) {
                    gradientPosition = \`\${percentX}% 100%\`;
                  } else if (isOnLeft) {
                    gradientPosition = \`0% \${percentY}%\`;
                  } else {
                    // Shouldn't happen, but just in case
                    gradientPosition = \`\${percentX}% \${percentY}%\`;
                  }
                  
                  // Apply the border effect
                  element.style.borderImage = \`radial-gradient(circle at \${gradientPosition}, rgba(255,255,255,\${intensity * 0.9}), rgba(255,255,255,0.1) \${Math.min(100, intensity * 200)}%) 1\`;
                  element.style.borderImageSlice = '1';
                  
                  // Ensure element has a border to show the effect
                  if (getComputedStyle(element).borderWidth === '0px') {
                    element.style.border = '1px solid transparent';
                  }
                  
                  // Add glow effect around the border
                  const glowSize = Math.round(intensity * 10);
                  const glowOpacity = intensity * 0.8;
                  element.style.boxShadow = \`0 0 \${glowSize}px rgba(255,255,255,\${glowOpacity})\`;
                  
                  // Add transition for smoother effect
                  element.style.transition = 'border-image 0.1s ease-out, box-shadow 0.1s ease-out';
                } else {
                  // Reset styles when cursor is far away
                  element.style.borderImage = '';
                  element.style.borderImageSlice = '';
                  element.style.boxShadow = '';
                  if (getComputedStyle(element).borderWidth === '1px' && 
                      getComputedStyle(element).borderColor === 'transparent') {
                    element.style.border = '';
                  }
                }
                
                // Remove background effect from previous version
                element.style.background = '';
                element.style.filter = '';
              });
            }
            
            // Initial application
            applyLiquidGlassBorderEffect();
            
            console.log("Liquid glass border effect initialized");
          })();
        `;
      } else if (!liquidGlassEffect && liquidGlassScriptElement) {
        // Remove the script if the effect is disabled
        liquidGlassScriptElement.remove();
        
        // Reset any applied styles
        const glassElements = document.querySelectorAll('.bg-white:not(nav):not(.navbar):not(header), .bg-gray-50:not(nav):not(.navbar):not(header), .bg-gray-100:not(nav):not(.navbar):not(header), .card:not(nav):not(.navbar):not(header), .rounded-lg.shadow-md:not(nav):not(.navbar):not(header), .rounded-lg.shadow-lg:not(nav):not(.navbar):not(header), .rounded-lg.shadow-xl:not(nav):not(.navbar):not(header), .rounded-md.shadow-md:not(nav):not(.navbar):not(header), .dark .bg-gray-800:not(nav):not(.navbar):not(header), .dark .bg-gray-900:not(nav):not(.navbar):not(header)');
        
        glassElements.forEach(element => {
          element.style.background = '';
          element.style.filter = '';
          element.style.boxShadow = '';
          element.style.borderColor = '';
          element.style.borderImage = '';
          element.style.borderImageSlice = '';
          element.style.transition = '';
          // Only reset border if it was added by our script
          if (getComputedStyle(element).borderWidth === '1px' && 
              getComputedStyle(element).borderColor === 'transparent') {
            element.style.border = '';
          }
        });
      }

      console.log("Liquid glass border effect updated successfully:", liquidGlassEffect ? "enabled" : "disabled");
    } catch (error) {
      console.error("Error applying liquid glass border effect:", error);
    }
  }, [liquidGlassEffect]);

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

  // Toggle custom cursor
  const toggleCustomCursor = () => {
    setCustomCursor(prev => !prev);
  };

  // Direct update for custom cursor
  const updateCustomCursor = (enabled) => {
    setCustomCursor(enabled);
  };

  // Toggle liquid glass effect
  const toggleLiquidGlassEffect = () => {
    setLiquidGlassEffect(prev => !prev);
  };

  // Direct update for liquid glass effect
  const updateLiquidGlassEffect = (enabled) => {
    setLiquidGlassEffect(enabled);
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
      updateBlurType,
      customCursor,
      toggleCustomCursor,
      updateCustomCursor,
      liquidGlassEffect,
      toggleLiquidGlassEffect,
      updateLiquidGlassEffect
    }}>
      {children}
    </ThemeContext.Provider>
  );
}; 