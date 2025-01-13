'use strict';

// Load plugins
var gulp = require('gulp');
var del = require('del');
var fileInclude = require('gulp-file-include');
var sass = require('gulp-sass')(require('sass'));
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();

// path
var root = './src/main/resources/static/';
var path = {
    in: {
        html: root + '_markup/html/**/*.html',
        html_page: root + '_markup/html/pages/**/*.html',
        html_include: root + '_markup/html/include',
        scss: root + '_markup/scss/**/*.scss',
        js: root + 'js/**/*.js'
    },
    out: {
        html: root + '_markup/view',
        css: root + 'css'
    }
};

// BrowserSync
function browserOpen(done) {
    browserSync.init({
        server: {
            baseDir: root
        },
        directory: true,
        port: 3000
    });
    done();
}

// Clean assets
function clean() {
    return del([path.out.html, path.out.css], { force: true });
}

// HTML task
function html() {
    return gulp
        .src(path.in.html_page)
        .pipe(fileInclude({
            basepath: path.in.html_include
        }))
        .pipe(gulp.dest(path.out.html));
}

// CSS task
function css() {
    return gulp
        .src(path.in.scss)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(autoprefixer({
            overrideBrowserslist: [
                '> 5%',
                'Firefox > 1',
                'last 4 version',
                'safari >= 12'
            ]
        }))
        .pipe(sourcemaps.write('.', { includeContent: false, addComment: false }))
        .pipe(gulp.dest(path.out.css))
        .pipe(browserSync.stream());
}

// Watch files
function watchFiles() {
    gulp.watch(path.in.html, html).on('change', browserSync.reload);
    // gulp.watch(path.in.js).on('change', browserSync.reload);
    gulp.watch(path.in.scss, css);
    // gulp.watch(path.in.scss, css).on('change', browserSync.reload);
}

// define complex tasks
var build = gulp.series(clean, gulp.parallel(html, css));
var watch = gulp.series(build, browserOpen, watchFiles);

// export tasks
exports.html = html;
exports.css = css;
exports.clean = clean;
exports.build = build;
exports.view = browserOpen;
exports.default = watch;
