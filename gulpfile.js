'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var insert = require('gulp-insert');
var autoprefixer = require('gulp-autoprefixer');
var gulpHogan = require('gulp-hogan');
var svg2png = require('svg2png');
var fs = require('fs');
var rename = require('gulp-rename');

// controls minification of JS, CSS, HTML, and building of images with `build`
var isProd = process.env.NODE_ENV === 'production';

gulp.task('default', function() {
  // Default task
});

gulp.task('build', ['js', 'html', 'gs', 'css', 'cutestrap'], function() {
  if (isProd) {
    buildImages();
  }
});

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

gulp.task('generate-test-site', ['build'], function() {
  return;
});

gulp.task('js', function() {
  if (isProd) {
    return gulp
      .src('./dist/bundle.js')
      .pipe(insert.wrap('<script>', '</script>'))
      .pipe(rename('js.html'))
      .pipe(gulp.dest('dist'));
  }
  return;
});

gulp.task('gs', function() {
  // concatenate
  if (isProd) {
    return gulp
      .src('./lib/**/*.js')
      .pipe(concat('application.gs'))
      .pipe(gulp.dest('dist'));
  }
  return;
});

gulp.task('css', function() {
  if (isProd) {
    return gulp
      .src('./src/css/main.scss')
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(autoprefixer({ browsers: ['last 10 versions'] }))
      .pipe(concat('css.html'))
      .pipe(insert.wrap('<style>', '</style>'))
      .pipe(gulp.dest('dist'));
  }
  return gulp
    .src('./src/css/main.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 10 versions'] }))
    .pipe(concat('css.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('cutestrap', function() {
  if (isProd) {
    return gulp
      .src('./src/css/my-cutestrap.scss')
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
      .pipe(concat('cutestrap.html'))
      .pipe(insert.wrap('<style>', '</style>'))
      .pipe(gulp.dest('dist'));
  }
  return gulp
    .src('./src/css/my-cutestrap.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(concat('cutestrap.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('html', function() {
  // process html

  return gulp
    .src('src/templates/index.html')
    .pipe(gulpHogan({ isProd: isProd }))
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
