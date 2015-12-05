var gulp = require('gulp'); // Node.js task runner
var del = require('del'); // Deletes files and folders
var liveServer = require('gulp-live-server'); // Lightweight local dev server
var browserSync = require('browser-sync'); // Live reload
var concat = require('gulp-concat'); // Concatenates files
var sass = require('gulp-sass'); // Compile SASS into CSS
var browserify = require('browserify'); // Bundles JS
var source = require('vinyl-source-stream'); // Use conventional text streams with Gulp
var eslint = require('gulp-eslint'); // Lint JS files
var config = require('./app.config'); // Project's configuration data


// Recursively delete the contents of the dist folder
gulp.task('clean', function() {
    return del(config.dist.dir + '/**/*');
});

// Copy all HTML files to the dist folder
gulp.task('html', function() {
    gulp.src(config.paths.html)
        .pipe(gulp.dest(config.dist.dir))
        .pipe(browserSync.stream());
});

// Compile sass into CSS, bundle to styles.css, copy to the dist folder & auto-inject into browsers
gulp.task('css', function() {
    return gulp.src(config.paths.css)
        .pipe(sass())
        .pipe(concat(config.css.bundleFile))
        .pipe(gulp.dest(config.dist.dir + '/' + config.css.dir))
        .pipe(browserSync.stream());
});

// Run ESLint on all javascript
gulp.task('lint', function() {
    return gulp.src(config.paths.js)
        .pipe(eslint('eslint.config.json'))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// Bundle all javascript using Browserify
gulp.task('js', ['lint'], function() {
    browserify(config.src.dir + '/' + config.js.dir + '/' + config.app.mainJsFile)
        .bundle() // Put it all in one file
        .on('error', console.error.bind(console))
        .pipe(source(config.js.bundleFile)) // Define the name of the bundle
        .pipe(gulp.dest(config.dist.dir + '/' + config.js.dir)) // Destination for the bundle
        .pipe(browserSync.stream()); // Reload the browser
});

// Start a local dev server
gulp.task('live-server', function() {
    var server = liveServer.static(config.dist.dir, config.dev.proxy.port);
    server.start();
});

// Run live reload using BrowserSync
gulp.task('serve', ['live-server'], function() {
    browserSync.init(null, {// 'null': we already have our server setup
        proxy: config.dev.protocol + '://' + config.dev.host + ':' + config.dev.proxy.port, // server URL
        port: config.dev.port // port for the new connection
    });
});

// Watch file changes
gulp.task('watch', function() {
    gulp.watch(config.paths.html, ['html']); // Run the "html" task every time a file is modified in the html dir
    gulp.watch(config.paths.css, ['css']); // Run the "css" task every time a sass file is modified
    gulp.watch(config.paths.js, ['js']); // Run the "js" task every time a js file is modified
});

// This task will fire up all the other tasks in the build
gulp.task('all', ['html', 'css', 'js'], function() {
    gulp.start('serve');
    gulp.start('watch');
});

// Make sure that the 'clean' task is complete before running the rest of the tasks
gulp.task('init', ['clean'], function() {
    gulp.start('all');
});

// Default task
gulp.task('default', ['init']);


