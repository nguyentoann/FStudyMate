// This fixes the "process/browser" resolution error in axios
// Create a simplified version of the process/browser module
// Based on what axios needs

// The version property is specifically checked by axios
const processPolyfill = {
  env: { NODE_ENV: process.env.NODE_ENV || 'development' },
  version: '16.0.0',
  nextTick: function(cb) { setTimeout(cb, 0); },
  browser: true
};

// Export as both default and a named export
export default processPolyfill;
export const process = processPolyfill;

// Install globally
window.process = processPolyfill; 