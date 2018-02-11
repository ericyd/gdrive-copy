'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var removeCode = require('gulp-remove-code');
var insert = require('gulp-insert');
var autoprefixer = require('gulp-autoprefixer');
var gulpHogan = require('gulp-hogan');
var svg2png = require('svg2png');
var fs = require('fs');
var rename = require('gulp-rename');

gulp.task('build', ['js', 'html', 'gs', 'css-prod', 'img']);

gulp.task('watch', function() {
  var watcher = gulp.watch(['./src/**/*'], ['build']);
  watcher.on('change', function(event) {
    console.log('Event:', event.path, event.type); // added, changed, or deleted
  });
});

gulp.task('watch-test-site', function() {
  var watcher = gulp.watch(['./src/**/*'], ['generate-test-site']);
  watcher.on('change', function(event) {
    console.log('Event:', event.path, event.type); // added, changed, or deleted
  });
});

gulp.task('generate-test-site', ['html-test-site', 'css-dev']);

gulp.task('js', function() {
  return gulp
    .src('./dist/bundle.js')
    .pipe(insert.wrap('<script>', '</script>'))
    .pipe(rename('js.html'))
    .pipe(gulp.dest('dist'));
});

gulp.task('gs', function() {
  return gulp
    .src('./lib/**/*.js')
    .pipe(removeCode({ production: true }))
    .pipe(concat('application.gs'))
    .pipe(gulp.dest('dist'));
});

gulp.task('css-prod', function() {
  return gulp
    .src('./src/css/main.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 10 versions'] }))
    .pipe(concat('css.html'))
    .pipe(insert.wrap('<style>', '</style>'))
    .pipe(gulp.dest('dist'));
});

gulp.task('css-dev', function() {
  return gulp
    .src('./src/css/main.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 10 versions'] }))
    .pipe(concat('css.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('html', function() {
  // process html
  return gulp
    .src('src/templates/index.html')
    .pipe(gulpHogan({ isProd: true }))
    .pipe(concat('index.html'))
    .pipe(gulp.dest('dist'));
});

gulp.task('html-test-site', function() {
  // process html
  return gulp
    .src('src/templates/index.html')
    .pipe(gulpHogan({ isProd: false }))
    .pipe(concat('index.html'))
    .pipe(gulp.dest('dist'));
});

gulp.task('img', buildImages);

function buildImages() {
  let img_path = './dist/icons/';
  fs.stat(img_path, (err, stat) => {
    if (err) fs.mkdir(img_path);
  });

  fs.readFile('./images/svg/small-banner.svg', (err, data) => {
    if (err) throw err;
    svg2png(data, { width: 440, height: 280 })
      .then(buffer =>
        fs.writeFile(img_path + 'small-banner.png', buffer, err => {
          if (err) throw err;
        })
      )
      .catch(e => console.error(e));
  });

  fs.readFile('./images/svg/large-banner.svg', (err, data) => {
    if (err) throw err;
    svg2png(data, { width: 920, height: 680 })
      .then(buffer =>
        fs.writeFile(img_path + 'large-banner.png', buffer, err => {
          if (err) throw err;
        })
      )
      .catch(e => console.error(e));
  });

  let sizes = ['256', '128', '96', '64', '48', '32', '16'];

  for (let i = 0; i < sizes.length; i++) {
    fs.readFile('./images/svg/cp-icon.svg', (err, data) => {
      if (err) throw err;
      svg2png(data, { width: sizes[i], height: sizes[i] })
        .then(buffer =>
          fs.writeFile(
            img_path + 'cp-icon-' + sizes[i] + '.png',
            buffer,
            err => {
              if (err) throw err;
            }
          )
        )
        .catch(e => console.error(e));
    });
  }
}
