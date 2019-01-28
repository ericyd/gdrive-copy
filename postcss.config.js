const autoprefixer = require('autoprefixer');
module.exports = {
  // parser: 'css',
  plugins: {
    //   'postcss-import': {},
    //   'postcss-preset-env': {},
    //   'cssnano': {}
    autoprefixer: { browsers: ['last 10 versions'] }
  }
};
