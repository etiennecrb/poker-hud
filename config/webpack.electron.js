const webpack = require('webpack');
const helpers = require('./helpers');

module.exports = {
  devtool: 'source-map',

  target: 'electron-main',

  entry: {
    'main': './main.ts'
  },

  output: {
    path: helpers.root('dist'),
    filename: '[name].js'
  },

  node: {
    __dirname: false,
    __filename: false
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: [
          {
            loader: 'awesome-typescript-loader',
            options: { configFileName: helpers.root('tsconfig.json') }
          }
        ]
      }
    ]
  },

  plugins: []
};
