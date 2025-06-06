import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to stabilize context values to prevent unnecessary re-renders
 * This is especially useful for context providers that poll frequently
 * 
 * @param {Object} value The context value to stabilize
 * @param {Array} trackedKeys Array of keys to track for changes
 * @param {Number} debounceMs Debounce time in milliseconds
 * @returns {Object} Stabilized context value
 */
export const useStabilizedContext = (value, trackedKeys = [], debounceMs = 500) => {
  const [stabilizedValue, setStabilizedValue] = useState(value);
  const debounceTimerRef = useRef(null);
  const previousValueRef = useRef({});
  
  useEffect(() => {
    if (!value) return;

    // Check if tracked keys have changed
    const hasChanged = trackedKeys.some(key => 
      value[key] !== previousValueRef.current[key]
    );

    if (hasChanged) {
      // If changes are detected, update after debounce time
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        setStabilizedValue(value);
        previousValueRef.current = { ...value };
      }, debounceMs);
    }
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, trackedKeys, debounceMs]);
  
  return stabilizedValue || value;
};

export default useStabilizedContext; 