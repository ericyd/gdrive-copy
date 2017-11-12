// webpack 1 version

/**
 * For more info on any of this, check out:
 * 1. https://github.com/verekia/js-stack-from-scratch/tree/master/tutorial/7-client-webpack
 * 2. create-react-app hello-world
 */

// const paths = require('./paths');
// const path = require('path');
// const StyleLintPlugin = require('stylelint-webpack-plugin');

// module.exports = {
//   entry: [
//     require.resolve('./polyfills'),
//     paths.appIndexJs
//   ],
//   output: {
//     filename: `bundle.js`,
//     path: paths.appBuild,
//     publicPath: "/",
//   },
//   devServer: {
//     inline: true
//   },
//   devtool: 'eval',
//   // devtool: 'source-map',
//   plugins: [
//     new StyleLintPlugin({
//       configFile: './config/stylelint.config.js',
//       syntax: 'scss',
//       failOnError: false
//     }),
//   ],
//   eslint: {
//     configFile: 'config/.eslintrc'
//   },
//   module: {
//     preLoaders: [
//       {
//         test: /\.(js|jsx)$/,
//         loader: 'eslint-loader',
//         include: paths.appSrc,
//       }
//     ],
//     loaders: [
//       {
//         test: /\.jsx?$/,
//         loader: 'babel-loader',
//         include: paths.appSrc,
//         exclude: [/node_modules/],
//       },
//       {
//         test: /\.(sc|sa|c)ss$/,
//         loaders: ["style", "css", "sass"]
//       },
//     ],
//   },
//   resolve: {
//     extensions: ['', '.js', '.jsx'],
//   },
//   // Some libraries import Node modules but don't use them in the browser.
//   // Tell Webpack to provide empty mocks for them so importing them works.
//   node: {
//     fs: 'empty',
//     net: 'empty',
//     tls: 'empty'
//   }
// };

// webpack 2 version

const readFileSync = require('fs').readFileSync;
const babelSettings = JSON.parse(readFileSync('./config/.babelrc'));
const paths = require('./paths');
const ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');
const StyleLintPlugin = require('stylelint-webpack-plugin');
// const wrapPlugin = require('./webpackWrapPlugin.js');

let plugins = [
  new StyleLintPlugin({
    configFile: './config/stylelint.config.js',
    syntax: 'scss',
    failOnError: false
  }),
  // this gives the compiled codebase access to process.env.NODE_ENV
  new webpack.EnvironmentPlugin(['NODE_ENV']),
  // new wrapPlugin({top: '<script>', bottom: '</script>', raw: true}),
  // new webpack.BannerPlugin({banner: 'this is a test banner', raw: true})
  new webpack.optimize.UglifyJsPlugin({
    beautify: true,
    mangle: false,
    sourceMap: false,
    comments: false
  })
];

// if (ENV === 'production') {
//   plugins = Array.prototype.concat(plugins.slice(0, 1), [new webpack.optimize.UglifyJsPlugin({
//     sourceMap: false,
//     comments: false
//   })], plugins.slice(1))
// }

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
          loader: 'babel-loader',
          query: babelSettings
        }
      },
      {
        test: /\.(sc|sa|c)ss$/,
        loaders: ['style', 'css', 'sass']
      }
    ]
  },
  devtool: 'inline-source-map'
};
