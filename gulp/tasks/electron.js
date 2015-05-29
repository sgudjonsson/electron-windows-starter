// Npm modules required for this setup.
var gulp = require('gulp');
var electronDownloader = require('gulp-download-electron');
var rimraf = require('rimraf');
var asar = require('gulp-asar');
var electronInstaller = require('atom-shell-installer');

// A task to download Atom-Shell utilizing https://github.com/r0nn/gulp-download-electron
// It downloads electron with the specified version, and unpacks it to a provided directory.
gulp.task('download-electron', function (cb) {
  electronDownloader({
    version: '0.27.1',
    outputDir: 'cache'
  }, cb);
});

// A cleanup task to keep our distribution preparation fresh.
// It cleans a directory that is next used as a start position to creating an installer.
gulp.task('clean-dist', function (cb) {
  rimraf('./dist', cb);
});

// Task to copy the downloaded electron into the distribution directory.
gulp.task('copy-electron', ['clean-dist'], function () {
  return gulp.src('./cache/**/*')
      .pipe(gulp.dest('dist/'));
});

// Task that copies all necessary app files into electron resources/app directory.
// This is a default directory used by electron.
// Copy there all files that your application needs to run properly.
gulp.task('prepare-app', ['clean-dist', 'copy-electron'], function () {
  return gulp.src(['./node_modules/**/*', './build/**/*', './package.json'], { base: './'})
    .pipe(gulp.dest('dist/resources/app'));
});

// Task to create an asar archive out of files required to run the application.
// This solves too long path issues on Windows.
gulp.task('create-archive', ['clean-dist', 'prepare-app'], function() {
  return gulp.src('dist/resources/app/**/*')
    .pipe(asar('app.asar'))
    .pipe(gulp.dest('dist/resources'));
});

// Task to clean no longer required resources/app folder as we now have the asar package.
gulp.task('clean-app', ['clean-dist', 'create-archive'], function (cb) {
  rimraf('./dist/resources/app', cb);
});

// Final task to create the installer and save it in the ./installer/ directory.
gulp.task('create-windows-installer', ['clean-app'], function (cb) {
  
  var packageData = require('../../package.json');
  
  electronInstaller({
    appDirectory: 'dist',
    outputDirectory: 'installer',
    exe: packageData.name + '.exe',
    description: packageData.description
  }).then(function () {
    cb();
  });
});