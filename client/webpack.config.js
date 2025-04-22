// const path = require('path')

// module.exports = {
//   mode: "production",
//   entry: path.resolve(__dirname, 'src', 'index.js'),
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: 'bundle.js'
//   },
//   module: {
//     rules: [
//       {
//         test: /\.(jsx|js)$/,
//         include: path.resolve(__dirname, 'src'),
//         exclude: /node_modules/,
//         use: [{
//           loader: 'babel-loader',
//           options: {
//             presets: [
//               ['@babel/preset-env', {
//                 "targets": "defaults" 
//               }],
//               '@babel/preset-react'
//             ]
//           }
//         }]
//       }
//     ]
//   }
// }

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { merge } = require('webpack-merge');
const base = require('./webpack.config.base')

module.exports = merge(base, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  output: {
    filename: 'static/js/main.js',
    chunkFilename: 'static/js/[name].chunk.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        // css-loader
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        // sass/scss loader to load sass-scss style files
        test: /\.(sass|scss)$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        // copies image files to assets folder in destination folder - dist
        test: /\.(svg|png|jpg|jpeg|gif|mp3|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'static/assets',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public', 'index.html'),
      favicon: path.resolve(__dirname, 'public', 'favicon.ico'),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "./")
    },
    port: 3000,
    hot: true,
  },
})