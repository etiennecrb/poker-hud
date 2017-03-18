const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const helpers = require('./helpers');

module.exports = {
  devtool: 'source-map',

  entry: {
    'app-hud': './app-hud/index.ts',
    'app-main': './app-main/main.ts'
  },

  output: {
    path: helpers.root('dist'),
    publicPath: './',
    filename: '[name].js'
  },

  target: 'electron-renderer',

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
          } , 'angular2-template-loader'
        ]
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        loader: 'file-loader?name=assets/[name].[hash].[ext]'
      },
      {
        test: /\.css$/,
        exclude: helpers.root('app-main', 'app'),
        loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader?sourceMap' })
      },
      {
        test: /\.css$/,
        include: helpers.root('app-main', 'app'),
        loader: 'raw-loader'
      }
    ]
  },

  plugins: [
    new ExtractTextPlugin('[name].css'),
    
    // Workaround for angular/angular#11580
    new webpack.ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      helpers.root('./app-main'),
      {} // a map of your routes
    ),

    new HtmlWebpackPlugin({
      filename: 'app-hud.html',
      chunks: ['app-hud'],
      template: './app-hud/index.html'
    }),

    new HtmlWebpackPlugin({
      filename: 'app-main.html',
      chunks: ['app-main'],
      template: './app-main/index.html'
    })
  ]
};
