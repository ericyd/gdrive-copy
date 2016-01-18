var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var insert = require('gulp-insert');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('default', function(){
    // Default task
    
});

gulp.task('build', ['js','html','css']);

gulp.task('watch', function(){ 
    var watcher = gulp.watch(['./src/**/*'], ['build']);
    watcher.on('change', function (event) {
        console.log('Event type: ' + event.type); // added, changed, or deleted
        console.log('Event path: ' + event.path);
    });
});

gulp.task('js', function() {
    // process js
    gulp.src(['./src/js/*.js', './node_modules/bootstrap-sass/assets/javascripts/bootstrap/button.js', './node_modules/bootstrap-sass/assets/javascripts/bootstrap/modal.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(concat('js.html'))
        .pipe(insert.wrap('<script>', '</script>'))
        .pipe(gulp.dest('dist'));
        
    gulp.src('./src/Code.gs')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(concat('Code.gs'))
        .pipe(gulp.dest('dist'));
        
    return;
});

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
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeCommentsFromCDATA: true,
            conservativeCollapse: true,
        }))
        .pipe(gulp.dest('dist'));
        
    return;
});