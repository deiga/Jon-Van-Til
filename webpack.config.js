const BabiliPlugin = require('babili-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    // Support for multiple entries
    './api/books/index.js': './api/books/index.js',
  },
  output: {
    libraryTarget: 'commonjs',
    path: `${__dirname}/.webpack`,
    filename: '[name]'
  },
  target: 'node',
  externals: [
    // Do not add aws-sdk - it is built-in in
    'aws-sdk'
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      { test: /\.json$/, loader: 'json-loader' }
    ],
  },
  resolve: {
    alias: {
      'dtrace-provider': './empty_shim.js',
      fs: './empty_shim.js',
      'safe-json-stringify': './empty_shim.js',
      mv: './empty_shim.js',
      'source-map-support': './empty_shim.js'
    }
  },
  plugins: [
    // new webpack.IgnorePlugin(/(regenerator|nodent|js-beautify)$/), // Unnecessary AJV deps

    // Assign the module and chunk ids by occurrence count
    new webpack.optimize.OccurrenceOrderPlugin(),

    // Chunk merging strategy
    new webpack.optimize.AggressiveMergingPlugin(),

    // Babili Babel minification
    new BabiliPlugin({ comments: false }),
  ],
};
