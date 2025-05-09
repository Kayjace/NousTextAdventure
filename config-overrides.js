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

  // Webpack 5의 fullySpecified 문제 해결
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: { fullySpecified: false },
  });


  // Add plugins to provide global objects
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  // Remove direct alias for process
  // config.resolve.alias = {
  //   ...config.resolve.alias,
  //   process: require.resolve('process/browser'),
  // };

  return config;
};
