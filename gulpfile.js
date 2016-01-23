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
var rename = require('gulp-rename');

gulp.task('default', function(){
    // Default task
});

// gulp.task('build', ['js','gs', 'html','css']);
gulp.task('build', ['brow','gs', 'html','css']);

gulp.task('watch', function(){ 
    var watcher = gulp.watch(['./src/**/*'], ['build']);
    watcher.on('change', function (event) {
        console.log('Event type: ' + event.type); // added, changed, or deleted
        console.log('Event path: ' + event.path);
    });
});

gulp.task('brow', function() {
    // globby(['./src/js/*.js', './node_modules/bootstrap-sass/assets/javascripts/bootstrap/button.js', './node_modules/bootstrap-sass/assets/javascripts/bootstrap/modal.js', './node_modules/jquery-ui/effect-blind.js']).then(function(entries) {


//     globby(['./src/js/*.js']).then(function(entries) {
//         var b = browserify({
//             entries: entries,
//             baseDir: './src/js',
//             debug: true
//         });
// 
//     return b.bundle()
//         .pipe(source('js.js'))
//         .pipe(buffer())
//         .pipe(jshint())
//         .pipe(jshint.reporter('default'))
//         .pipe(uglify())
//         .pipe(concat('js.html'))
//         .pipe(insert.wrap('<script>', '</script>'))
//         .pipe(gulp.dest('dist'));
//     });
    
    /* Todo: fix browserify 
    This is a HIGHLY imperfect way of executing*/
    gulp.src('./src/js/*.js').pipe(concat('tmp.js')).pipe(gulp.dest('src/tmp'));
    
    var b = browserify({
        entries: './src/tmp/tmp.js',
        baseDir: './src/tmp/',
        debug: true
    })
    
    return b.bundle()
        .pipe(source('js.js'))
        .pipe(buffer())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(concat('js.html'))
        .pipe(insert.wrap('<script>', '</script>'))
        .pipe(gulp.dest('dist'));
    
})

gulp.task('js', function() {
    // process js
    gulp.src(['./src/js/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(concat('js.html'))
        .pipe(insert.wrap('<script>', '</script>'))
        .pipe(gulp.dest('dist'));
        
    return;
});




gulp.task('gs', function() {
    // jshint and minify Code.gs
    gulp.src('./src/Code.gs')
        .pipe(changed('dist'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
    
    return;
})




gulp.task('css', function() {
    // process css
    gulp.src('./src/css/main.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(concat('css.html'))
        .pipe(insert.wrap('<style>', '</style>'))
        .pipe(gulp.dest('dist'));
        
    return;
});




gulp.task('html', function() {
    // process html  
    gulp.src('./src/Index.html')
        .pipe(changed('dist'))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeCommentsFromCDATA: true,
            conservativeCollapse: true,
        }))
        .pipe(gulp.dest('dist'));
        
    return;
});