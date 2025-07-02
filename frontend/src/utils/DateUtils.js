/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date string to a localized date string
 * @param {string|Date} dateString - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Default options
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
};

/**
 * Check if a date is in the past (overdue)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {boolean} True if date is in the past
 */
export const isDateOverdue = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    const today = new Date();
    
    // Set time to beginning of day for comparison
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    return compareDate < today;
  } catch (error) {
    console.error('Error checking if date is overdue:', error);
    return false;
  }
};

/**
 * Get the relative time string (e.g., "2 days ago", "in 3 hours")
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Relative time string
 */
export const getRelativeTimeString = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((date - now) / 1000);
    const absSeconds = Math.abs(diffInSeconds);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Define time units in seconds
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;
    
    let output;
    
    if (absSeconds < minute) {
      output = 'just now';
    } else if (absSeconds < hour) {
      const minutes = Math.floor(absSeconds / minute);
      output = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (absSeconds < day) {
      const hours = Math.floor(absSeconds / hour);
      output = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (absSeconds < week) {
      const days = Math.floor(absSeconds / day);
      output = `${days} day${days > 1 ? 's' : ''}`;
    } else if (absSeconds < month) {
      const weeks = Math.floor(absSeconds / week);
      output = `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else if (absSeconds < year) {
      const months = Math.floor(absSeconds / month);
      output = `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(absSeconds / year);
      output = `${years} year${years > 1 ? 's' : ''}`;
    }
    
    return diffInSeconds < 0 ? `${output} ago` : `in ${output}`;
  } catch (error) {
    console.error('Error getting relative time string:', error);
    return '';
  }
};

/**
 * Format a date range
 * @param {string|Date} startDate - Start date string or Date object
 * @param {string|Date} endDate - End date string or Date object
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Invalid date range';
  
  try {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid date range';
    }
    
    // If same day, show only one date with time range
    if (start.toDateString() === end.toDateString()) {
      return `${formatDate(start)} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date range
    return `${formatDate(start)} - ${formatDate(end)}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return 'Error';
  }
};

export default {
  formatDate,
  isDateOverdue,
  getRelativeTimeString,
  formatDateRange
}; 