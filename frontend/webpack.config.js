const path = require('path');

// This webpack config should be included in .gitignore as it's just a workaround
module.exports = {
  resolve: {
    alias: {
      // Alias process/browser to our custom implementation
      'process/browser': path.resolve(__dirname, 'src/processBrowserPolyfill.js')
    }
  }
}; 