const webpack = require("webpack");
const path = require("path");

module.exports = function override(config, env) {
  // Fix for process/browser error in axios
  config.resolve.alias = {
    ...config.resolve.alias,
    "process/browser": path.resolve(__dirname, "src/processBrowserPolyfill.js"),
  };

  // Simplified fallbacks
  config.resolve.fallback = {
    ...config.resolve.fallback,
    process: path.resolve(__dirname, "src/processBrowserPolyfill.js"),
    buffer: require.resolve("buffer"),
  };

  // Add webpack plugins for global objects
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: ["process/browser"],
      Buffer: ["buffer", "Buffer"],
    }),
  ];

  return config;
};
