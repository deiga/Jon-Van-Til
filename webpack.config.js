const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  devtool: "source-map",
  target: "node",
  externals: [
    /aws-sdk/, // Available on AWS Lambda
    nodeExternals(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: __dirname,
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  performance: {
    // Turn off size warnings for entry points
    hints: false,
  },
};
