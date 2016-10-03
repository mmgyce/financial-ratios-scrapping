var gulp = require ('gulp');
var ts = require('gulp-typescript');
var nodemon = require('gulp-nodemon');
var runSequence = require('run-sequence');
var clean = require('gulp-clean');
var sourceMaps = require('gulp-sourcemaps');
var mocha = require('gulp-mocha');

gulp.task('typescript', function(){
	var tsResult = gulp.src('src/**/*.ts')
	.pipe(sourceMaps.init())
	.pipe(ts({
		noImplicitAny : true,
		module : "commonjs"
	}));

	return tsResult.js
	.pipe(sourceMaps.write())
		.pipe(gulp.dest('dist'));
});

gulp.task('server', function(){
	return nodemon({
		script : 'dist/finance.js'
	});
});

gulp.task('clean', function(){
	return gulp.src('dist')
	.pipe(clean());
});

gulp.task('watch', function(){
	return gulp.watch('src/**/*.ts', ['typescript']);
})

gulp.task('default', function(){
	runSequence('clean','typescript', 'watch', 'server');
})
