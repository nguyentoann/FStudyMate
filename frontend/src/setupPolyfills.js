// Basic polyfills for browser compatibility
import 'react-app-polyfill/stable';

// Define process for axios
window.process = window.process || {
  env: { NODE_ENV: 'development' },
  version: '16.0.0',  // Needed by axios
  browser: true,
  nextTick: function(cb) { setTimeout(cb, 0); }
};

// Define global
window.global = window;

// Define Buffer
window.Buffer = require('buffer').Buffer; 