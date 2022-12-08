const path = require('path');

module.exports = {
  entry: {
    './src/index.js': [
    ]
  },
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
        minimize: false
    }
};
