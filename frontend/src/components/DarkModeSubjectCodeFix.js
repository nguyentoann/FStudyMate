import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * This component injects additional CSS fixes for specific edge cases in dark mode
 * Using a direct DOM approach to preserve subject-code styling
 */
const DarkModeSubjectCodeFix = () => {
  const { darkMode } = useTheme();
  
  useEffect(() => {
    // Create a style element if it doesn't exist
    let styleEl = document.getElementById('dark-mode-subject-code-fix');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dark-mode-subject-code-fix';
      document.head.appendChild(styleEl);
    }
    
    // Function to apply direct style overrides to subject-code elements
    const applySubjectCodeFix = () => {
      if (!darkMode) return;
      
      // Store original styles of all subject code elements
      const subjectCodes = document.querySelectorAll('span.subject-code');
      subjectCodes.forEach(element => {
        if (!element.dataset.originalStyleCaptured) {
          // Store original computed style
          const styles = window.getComputedStyle(element);
          
          // Capture important style properties
          element.dataset.originalColor = styles.color;
          element.dataset.originalBgColor = styles.backgroundColor;
          element.dataset.originalFontSize = styles.fontSize;
          element.dataset.originalFontWeight = styles.fontWeight;
          
          // Mark as captured
          element.dataset.originalStyleCaptured = 'true';
          
          // Apply direct style overrides
          element.style.setProperty('color', element.dataset.originalColor, 'important');
          element.style.setProperty('background-color', element.dataset.originalBgColor, 'important');
          element.style.setProperty('font-size', element.dataset.originalFontSize, 'important');
          element.style.setProperty('font-weight', element.dataset.originalFontWeight, 'important');
          element.style.setProperty('filter', 'none', 'important');
          element.style.setProperty('-webkit-filter', 'none', 'important');
        }
      });
    };
    
    // Set up a MutationObserver to detect when new subject-code elements are added
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // Check if we need to apply fix to new elements
          applySubjectCodeFix();
        }
      });
    });

    // If dark mode is enabled, inject the CSS fixes
    if (darkMode) {
      // Immediate fix for current elements
      applySubjectCodeFix();
      
      // Start observing for new elements
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // CSS-based fallback fix
      styleEl.textContent = `
        /* Direct fix for subject code - ensure original styling is preserved */
        span.subject-code,
        h2 span.subject-code,
        [class*="materials"] span.subject-code {
          color: #c026d3 !important; /* Purple color from screenshot */
          background-color: transparent !important;
          font-size: 2rem !important;
          font-weight: bold !important;
          filter: none !important;
          -webkit-filter: none !important;
          opacity: 1 !important;
        }
      `;
    } else {
      // Clear the fixes when dark mode is disabled
      styleEl.textContent = '';
      observer.disconnect();
    }
    
    return () => {
      // Clean up
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
      observer.disconnect();
    };
  }, [darkMode]);

  return null; // This is a utility component that doesn't render anything
};

export default DarkModeSubjectCodeFix; 