const webpack = require('webpack');

module.exports = function override(config) {
  // Polyfill Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    util: require.resolve('util'),
    assert: require.resolve('assert'),
    zlib: require.resolve('browserify-zlib'),
    process: require.resolve('process/browser'),
  };

  // Add plugins to provide global objects
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    // Fix process/browser.js not found issue for ESM
    new webpack.NormalModuleReplacementPlugin(
      /node:process/,
      (resource) => {
        resource.request = 'process/browser';
      }
    ),
    new webpack.NormalModuleReplacementPlugin(
      /process\/browser/,
      require.resolve('process/browser')
    ),
  ];

  return config;
}; 