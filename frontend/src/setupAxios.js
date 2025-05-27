// This file patches axios to work with our polyfills
import axios from 'axios';

// Fix for axios expecting process
if (typeof process === 'undefined' || !process.version) {
  // Ensure process.version exists as axios checks for it
  if (!window.process) {
    window.process = {};
  }
  window.process.version = '16.0.0'; // Fake Node.js version
}

export default axios; 