const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        // transpiles react code
        test: /\.(js|jsx)$/,
        include: /src/,
        loader: 'babel-loader',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.json', '.jsx'],
  },
  plugins: [new ESLintPlugin()]
}