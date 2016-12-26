var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglifyJS = require('gulp-uglify'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('gulp-cssnano'),
    pug = require('gulp-pug'),
    pump = require('pump');
 
gulp.task('styles', function(cb) {
  pump([
    gulp.src([
      './app/bower_components/bootstrap/dist/css/bootstrap.css',
      './app/app.css'
    ]),
    concat('styles.css'),
    postcss([ autoprefixer() ]),
    //cssnano(),
    (gulp.dest('./app/bundles'))
  ], cb)
});

gulp.task('scripts', function(cb) {
  pump([
    gulp.src([
      './app/bower_components/angular/angular.js',
      './app/bower_components/angular-ui-router/release/angular-ui-router.js',
      './app/bower_components/Snap.svg/dist/snap.svg.js',
      './app/app.module.js',
      './app/app.service.js',
      './app/app.config.js',
      './app/login/login.component.js',
      './app/map/map.component.js'
    ]),
    concat('scripts.js'),
    //uglifyJS(),
    gulp.dest('./app/bundles')
  ], cb)
});
 
gulp.task('templates', function(cb) {
  pump([
    gulp.src([
      './app/index.pug',
      './app/login/login.template.pug',
      './app/map/map.template.pug'
    ]),
    pug(),
    gulp.dest(function(file){
      return file.base;
    })
  ], cb)
});

//gulp.task('watch', function() {
//  gulp.watch('./app/**/*.css', ['styles']);
//  gulp.watch('./app/**/*.js', ['scripts']);
//  gulp.watch('./app/**/*.jade', ['templates'])
//});

gulp.task('default', ['styles', 'scripts', 'templates']);