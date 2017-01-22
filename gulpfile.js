const
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglifyJS = require('gulp-uglify'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('gulp-cssnano'),
    pug = require('gulp-pug'),
    babel = require('gulp-babel'),
    stylus = require('gulp-stylus'),
    revAppend = require('gulp-rev-append'),
    pump = require('pump'),

    sources = {
        css: [
            './app/bower_components/bootstrap/dist/css/bootstrap.css'
        ],
        styles: [
            './app/app.stylus'
        ],
        lib: [
            './app/bower_components/angular/angular.js',
            './app/bower_components/angular-ui-router/release/angular-ui-router.js',
            './app/bower_components/Snap.svg/dist/snap.svg.js'
        ],
        scripts: [
            './app/app.module.js',
            './app/app.service.js',
            './app/app.config.js',
            './app/core/core.module.js',
            './app/core/auth/auth.module.js',
            './app/core/auth/auth.service.js',
            './app/core/notify/notify.module.js',
            './app/core/notify/notify.service.js',
            './app/login/login.module.js',
            './app/login/login.component.js',
            './app/map/map.module.js',
            './app/map/map.component.js'
        ],
        templates: [
            './app/index.pug',
            './app/login/login.template.pug',
            './app/map/map.template.pug'
        ]
    };
 
gulp.task('css', function(cb) {
    pump([
        gulp.src(sources.css),
        concat('vendor.css'),
        postcss([ autoprefixer() ]),
        //cssnano(),
        (gulp.dest('./app/bundles'))
    ], cb)
});

gulp.task('styles', function(cb) {
    pump([
        gulp.src(sources.styles),
        stylus(),
        concat('styles.css'),
        postcss([ autoprefixer() ]),
        //cssnano(),
        (gulp.dest('./app/bundles'))
    ], cb)
});

gulp.task('lib', function(cb) {
    pump([
        gulp.src(sources.lib),
        concat('vendor.js'),
        //uglifyJS(),
        gulp.dest('./app/bundles')
    ], cb)
});

gulp.task('scripts', function(cb) {
    pump([
        gulp.src(sources.scripts),
        babel({ presets: ['es2015'] }),
        concat('scripts.js'),
        //uglifyJS(),
        gulp.dest('./app/bundles')
    ], cb)
});
 
gulp.task('templates', function(cb) {
    pump([
        gulp.src(sources.templates),
        pug(),
        revAppend(),
        gulp.dest(function(file){
            return file.base;
        })
    ], cb)
});

gulp.task('watch', function() {
    gulp.watch(sources.styles, ['styles']);
    gulp.watch(sources.scripts, ['scripts']);
    gulp.watch(sources.templates, ['templates'])
});

gulp.task('default', ['css', 'styles', 'lib', 'scripts', 'templates']);