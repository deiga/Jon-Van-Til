module.exports = function config(api) {
  api.cache.never()
  return {
    presets: [
      ['@babel/preset-env', {
        targets: {
          node: '8.10',
        },
      }],
    ],
    plugins: [
      'babel-plugin-source-map-support',
    ],
  };
};
