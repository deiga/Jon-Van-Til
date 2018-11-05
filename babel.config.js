module.exports = function (api) {
  api.cache.never()
  return {
    presets: [
      ["@babel/preset-env", {
        targets: {
          "node": "8.10"
        }
      }]
    ],
    "plugins": [
      "@babel/plugin-transform-runtime",
      "babel-plugin-source-map-support",
      "@babel/plugin-transform-modules-commonjs"
    ]
  }
}
