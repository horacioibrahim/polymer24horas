var gulp = require('gulp');
var browserSync = require('browser-sync');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-clean-css');
var image = require('gulp-imagemin');
var vulcanize = require('gulp-vulcanize');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var inject = require('gulp-inject-string');
var reload = browserSync.reload;

// watch files for changes and reload
gulp.task('serve', function(){
    browserSync({
        server: {
            baseDir: 'www'
        }
    });
    gulp.watch('www/assets/vendor/materialize/sass/**/*.scss', ['sass']);
    gulp.watch(['*.html', '**/*.html', 'www/assets/js/*.js', 'www/assets/css/app.css'], {cwd: '.'}, browserSync.reload);
});

// compress js
gulp.task('minify-js', function(){
    return gulp.src('www/assets/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist/assets/js'));
});

gulp.task('sass-default', function(){
    return gulp.src('www/assets/scss/materialize/sass/materialize.scss')
        .pipe(sass()) // using gulp-sass
        .pipe(gulp.dest("./www/assets/css"));
});

// Pulo do gato para compartilhar estilos externos.
// https://www.polymer-project.org/1.0/docs/devguide/styling [Shared styles and external stylesheets] 
gulp.task('inject:prepend', ['sass-default'], function(){
    return gulp.src('www/assets/css/materialize.css')
        .pipe(inject.prepend('<!-- shared styles for all views -->\n<dom-module id="shared-styles">\n<template>\n<style>\n'))
        .pipe(rename('shared-styles.html'))
        .pipe(gulp.dest('./www'));
});
gulp.task('inject:append', ['inject:prepend'], function(){
    return gulp.src('www/shared-styles.html')
        .pipe(inject.append('</style>\n</template>\n</dom-module>'))
        .pipe(gulp.dest('./dist'))
});
gulp.task('sass', ['inject:append']);


// compress css
gulp.task('minify-css', ['sass'], function(){
    return gulp.src('www/assets/css/*.css')
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('./dist/assets/css'));
});
// compress image
gulp.task('image', function(){
    gulp.src('www/assets/images/**')
       .pipe(image())
       .pipe(gulp.dest('./dist/assets/images'));
});

// vulcanize polymer
gulp.task('vulcanize', function(){
    return gulp.src('www/index.html')
        .pipe(vulcanize({
            stripComments: true,
            inlineCss: true
        }))
        .pipe(gulp.dest('./dist'));
});

// copy polymer elements required
gulp.src(['www/assets/fonts/**/*']).pipe(gulp.dest('./dist/assets/fonts'));
gulp.src(['www/elements/**/*']).pipe(gulp.dest('./dist/elements'));
gulp.src(['www/views/**/*']).pipe(gulp.dest('./dist/views'));
gulp.src(['www/templates/**/*']).pipe(gulp.dest('./dist/templates'));
gulp.src(['www/assets/vendor/**/*']).pipe(gulp.dest('./dist/assets/vendor'));

// distribution task
gulp.task('dist', ['image', 'minify-js', 'minify-css', 'vulcanize']);
