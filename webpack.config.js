const BabiliPlugin = require('babel-minify-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  output: {
    libraryTarget: 'commonjs',
    path: `${__dirname}/.webpack`,
    filename: '[name]',
  },
  target: 'node',
  externals: [
    'aws-sdk',
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      'dtrace-provider': './empty_shim.js',
      fs: './empty_shim.js',
      'safe-json-stringify': './empty_shim.js',
      mv: './empty_shim.js',
      'source-map-support': './empty_shim.js',
    },
  },
  optimization: {
    namedModules: true,
      splitChunks: {
        name: 'vendor',
        minChunks: 2
      },
      noEmitOnErrors: true,
      concatenateModules: true
  },
  plugins: [
    // new webpack.IgnorePlugin(/(regenerator|nodent|js-beautify)$/), // Unnecessary AJV deps

    // Chunk merging strategy
    new webpack.optimize.AggressiveMergingPlugin(),

    // Babili Babel minification
    new BabiliPlugin({ comments: false }),
  ],
};
