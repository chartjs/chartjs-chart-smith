var concat = require('gulp-concat'),
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	package = require('./package.json'),
	replace = require('gulp-replace'),
	umd = require('gulp-umd'),
	util = require('gulp-util');

var srcDir = './src/';
var srcFiles = srcDir + '**.js';
var buildDir = '.';

gulp.task('build', buildTask);
gulp.task('jshint', jsHintTask);

function buildTask() {
	return gulp.src(srcFiles)
		.pipe(concat('Chart.Smith.js'))
		.pipe(replace('{{ version }}', package.version))
		.pipe(umd({
			templateName: 'amdCommonWeb',
			dependencies: function() {
				return ['Chart']
			}
		}))
		.pipe(gulp.dest(buildDir));
}

function jsHintTask() {
	return gulp.src(srcFiles)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
}