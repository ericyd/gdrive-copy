// Must set this before running anything else
process.env.NODE_ENV = 'production';

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
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  new webpack.optimize.AggressiveMergingPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      screw_ie8: true, // React doesn't support IE8
      warnings: false
    },
    mangle: {
      screw_ie8: true
    },
    output: {
      comments: false,
      screw_ie8: true
    },
    // Google Apps Script works better if the code is not on a single line
    beautify: true
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
  devtool: 'cheap-module-source-map',
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};
