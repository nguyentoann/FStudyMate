import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * This component ensures that subject-code spans retain their light mode styling
 * by directly manipulating the DOM elements
 */
const SubjectCodeLightModePreserver = () => {
  const { darkMode } = useTheme();
  
  useEffect(() => {
    // Function to process all subject-code spans
    const preserveSubjectCodeStyling = () => {
      // Get all subject-code elements
      const subjectCodes = document.querySelectorAll('span.subject-code');
      
      if (subjectCodes.length === 0) return;
      
      // Process each element
      subjectCodes.forEach(element => {
        // Apply our preservation class
        element.classList.add('preserve-light-mode');
        
        // Directly override the styling if in dark mode
        if (darkMode) {
          // Force the purple color from the screenshot
          element.style.setProperty('color', '#c026d3', 'important');
          
          // Prevent dark mode effects
          element.style.setProperty('filter', 'none', 'important');
          element.style.setProperty('-webkit-filter', 'none', 'important');
          element.style.setProperty('opacity', '1', 'important');
          
          // Make sure text is visible
          element.style.setProperty('visibility', 'visible', 'important');
          element.style.setProperty('display', 'inline-block', 'important');
          
          // Prevent background color changes
          element.style.setProperty('background-color', 'transparent', 'important');
          
          // In MAE101 header
          if (element.closest('h2')) {
            element.style.setProperty('font-size', '2rem', 'important');
            element.style.setProperty('font-weight', 'bold', 'important');
          }
        } else {
          // In light mode, remove any direct style overrides
          element.style.removeProperty('color');
          element.style.removeProperty('filter');
          element.style.removeProperty('-webkit-filter');
          element.style.removeProperty('opacity');
          element.style.removeProperty('visibility');
          element.style.removeProperty('background-color');
          element.style.removeProperty('font-size');
          element.style.removeProperty('font-weight');
        }
      });
    };
    
    // Process existing elements immediately
    preserveSubjectCodeStyling();
    
    // Set up observer to handle dynamically added elements
    const observer = new MutationObserver(mutations => {
      let needsProcessing = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          needsProcessing = true;
        }
      });
      
      if (needsProcessing) {
        preserveSubjectCodeStyling();
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Clean up
    return () => {
      observer.disconnect();
    };
  }, [darkMode]);
  
  return null; // This component doesn't render anything
};

export default SubjectCodeLightModePreserver; 