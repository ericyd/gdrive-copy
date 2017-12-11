// Must set this before running anything else
process.env.NODE_ENV = 'development';

// webpack 2 version

const readFileSync = require('fs').readFileSync;
const paths = require('./paths');
const webpack = require('webpack');
const StyleLintPlugin = require('stylelint-webpack-plugin');

let plugins = [
  new StyleLintPlugin({
    configFile: './config/stylelint.config.js',
    syntax: 'scss',
    failOnError: false
  }),
  // this gives the compiled codebase access to process.env.NODE_ENV
  new webpack.EnvironmentPlugin(['NODE_ENV']),
  new webpack.optimize.UglifyJsPlugin({
    beautify: true,
    mangle: false,
    sourceMap: false,
    comments: false
  })
];

module.exports = {
  entry: {
    index: ['./src/index.js']
  },
  resolve: {
    extensions: ['.js', '.html']
  },
  output: {
    path: paths.appBuild,
    filename: 'bundle.js',
    chunkFilename: '[name].[id].js'
  },
  plugins: plugins,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: paths.appSrc,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(sc|sa|c)ss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  devtool: 'inline-source-map'
};
