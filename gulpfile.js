"use strict";

var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var insert = require('gulp-insert');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var changed = require('gulp-changed');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var globby = require('globby');  
var svg2png = require("svg2png");
var fs = require('fs');
var gulpHogan = require('gulp-hogan');

gulp.task('default', function(){
    // Default task
});

gulp.task('build', ['jslint', 'js','gs', 'html','css', 'cutestrap']);

gulp.task('watch', function(){ 
    var watcher = gulp.watch(['./src/**/*'], ['build']);
    watcher.on('change', function (event) {
        console.log('Event type: ' + event.type); // added, changed, or deleted
        console.log('Event path: ' + event.path);
    });
});


var compiler = require('gulp-hogan-compile');
var hogan = require('hogan.js');
var templates = {};

gulp.task('templates', function() {
    gulp.src('src/templates/*.mustache')
        .pipe(compiler(templates))
        .pipe(gulp.dest('dist'));
    console.log('templates: ');
    console.log(templates);
});



gulp.task('js', function() {
    globby(['./src/js/*.js']).then(function(entries) {
        var b = browserify({
            entries: entries,
            baseDir: './src/js',
            debug: true
        });
        

        return b.bundle()
            .pipe(source('js.html'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(insert.wrap('<script>', '</script>'))
            .pipe(gulp.dest('dist'));
    });    
})



gulp.task('gs', function() {
    // jshint and minify Code.gs
    return gulp.src('./src/gs/*.js')
        .pipe(changed('dist'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('Code.gs'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
    
})




gulp.task('css', function() {
    // process css
    
    return gulp.src('./src/css/main.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(concat('css.html'))
        .pipe(insert.wrap('<style>', '</style>'))
        .pipe(gulp.dest('dist'));
        
});



gulp.task('cutestrap', function() {
    return gulp.src('./src/css/my-cutestrap.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(concat('cutestrap.html'))
        .pipe(insert.wrap('<style>', '</style>'))
        .pipe(gulp.dest('dist'));
});




gulp.task('html', function() {
    // process html  
    
    return gulp.src('src/templates/complete.mustache')
        .pipe(changed('dist'))
        .pipe(gulpHogan())
        .pipe(concat('Index.html'))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeCommentsFromCDATA: true,
            conservativeCollapse: true,
            minifyJS: true
        }))
        .pipe(gulp.dest('dist'));
});



gulp.task('img', function() {
    let img_path = "./dist/icons/";
    fs.stat(img_path, (err, stat) => {
        if (err) fs.mkdir(img_path);    
    });
    
     
    fs.readFile("./images/svg/small-banner.svg", (err, data) => {
        if (err) throw err;
        svg2png(data, { width: 440, height: 280 })
            .then(buffer => fs.writeFile(img_path + "small-banner.png", buffer, (err) => {
                if (err) throw err;
            }))
            .catch(e => console.error(e));
    });
    
    fs.readFile("./images/svg/large-banner.svg", (err, data) => {
        if (err) throw err;
        svg2png(data, { width: 920, height: 680 })
            .then(buffer => fs.writeFile(img_path + "large-banner.png", buffer, (err) => {
                if (err) throw err;
            }))
            .catch(e => console.error(e));
    });
    
    let sizes = ['256','128','96','64','48','32','16'];
    
    for (let i = 0; i < sizes.length; i++) {
        fs.readFile("./images/svg/cp-icon.svg", (err, data) => {
            if (err) throw err;
            svg2png(data, { width: sizes[i], height: sizes[i] })
                .then(buffer => fs.writeFile(img_path + "cp-icon-" + sizes[i] + ".png", buffer, (err) => {
                    if (err) throw (err);
                }))
                .catch(e => console.error(e));
        });
    }
    
       
    
})



gulp.task('jslint', function() {
    return gulp.src('./src/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
})