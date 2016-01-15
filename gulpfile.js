var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var insert = require('gulp-insert');

gulp.task('default', function(){
    // Default task
    
});

gulp.task('build', ['js','html','css']);

gulp.task('js', function() {
    // process js
    gulp.src('./src/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(concat('js.html'))
        .pipe(insert.wrap('<script>', '</script>'))
        .pipe(gulp.dest('dist'));
        
    gulp.src('./src/Code.gs')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
    // process css
    gulp.src('./src/css/main.css')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('css.html'))
        .pipe(insert.wrap('<style>', '</style>'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('html', function() {
    // process html
    gulp.src('./src/Index.html')
        // .pipe(htmlmin({
        //     collapseWhitespace: true,
        //     removeComments: true,
        //     removeCommentsFromCDATA: true,
        //     conservativeCollapse: true,
        // }))
        .pipe(gulp.dest('dist'));
});