var concat = require('gulp-concat'),
	gulp = require('gulp'),
	replace = require('gulp-concat'),
	umd = require('gulp-umd'),
	util = require('gulp-util');

var srcDir = './src/';
var srcFiles = srcDir + '**.js';
var buildDir = '.';

function buildTask() {
	return gulp.src(srcFiles)
		.pipe(concat('Chart.Smith.js'))
		.pipe(replace('{{ version }}', package.version))
		.pipe(umd({
			template: 'amdCommonWeb',
			dependencies: function() {
				return ['Chart']
			}
		}))
		.pipe(gulp.dest(buildDir));
}

gulp.task('build', buildTask);