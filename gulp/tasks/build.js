var gulp = require('gulp');

gulp.task('build', function() {
	gulp.src('./src/**/*')
		.pipe(gulp.dest('./build'));
});