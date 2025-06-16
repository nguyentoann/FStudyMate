const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add Node.js polyfills
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        process: require.resolve('process/browser'),
        buffer: require.resolve('buffer'),
        util: require.resolve('util/'),
        stream: require.resolve('stream-browserify'),
        crypto: false,
        zlib: false,
        http: false,
        https: false,
        path: false,
        fs: false,
      };

      // Add plugins
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: ['process/browser'],
          Buffer: ['buffer', 'Buffer'],
        }),
      ];

      // Support for GLB files
      webpackConfig.module.rules.push({
        test: /\.(glb|gltf)$/,
        type: 'asset/resource',
      });

      return webpackConfig;
    },
    plugins: [
      new NodePolyfillPlugin(),
    ],
  },
}; 