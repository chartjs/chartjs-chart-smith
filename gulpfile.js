/* eslint-disable import/no-nodejs-modules, import/no-commonjs, no-use-before-define */

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const file = require('gulp-file');
const replace = require('gulp-replace');
const streamify = require('gulp-streamify');
const zip = require('gulp-zip');
const karma = require('karma');
const merge = require('merge2');
const path = require('path');
const {exec} = require('child_process');
const pkg = require('./package.json');

const argv = require('yargs')
	.option('output', {alias: 'o', default: 'dist'})
	.option('docs-dir', {default: 'docs'})
	.option('www-dir', {default: 'www'})
	.argv;

function run(bin, args) {
	return new Promise((resolve, reject) => {
		const exe = '"' + process.execPath + '"';
		const src = require.resolve(bin);
		const ps = exec([exe, src].concat(args || []).join(' '));

		ps.stdout.pipe(process.stdout);
		ps.stderr.pipe(process.stderr);
		ps.on('close', (error) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}

gulp.task('build', () => run('rollup/dist/bin/rollup', ['-c', argv.watch ? '--watch' : '']));

gulp.task('test', (done) => {
	new karma.Server({
		configFile: path.join(__dirname, 'karma.config.js'),
		singleRun: !argv.watch,
		args: {
			coverage: !!argv.coverage,
			inputs: (argv.inputs || 'test/specs/**/*.js').split(';'),
			watch: argv.watch
		}
	},
	(error) => {
		// https://github.com/karma-runner/gulp-karma/issues/18
		error = error ? new Error('Karma returned with the error code: ' + error) : undefined;
		done(error);
	}).start();
});

gulp.task('lint', () => {
	const files = [
		'src/**/*.js',
		'test/**/*.js',
		'*.js'
	];

	return gulp.src(files)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('docs', () => {
	const mode = argv.watch ? 'dev' : 'build';
	const out = path.join(argv.output, argv.docsDir);
	const args = argv.watch ? '' : '--dest ' + out;
	return run('vuepress', [mode, 'docs', args]);
});

gulp.task('bower', () => {
	const json = JSON.stringify({
		name: pkg.name,
		description: pkg.description,
		homepage: pkg.homepage,
		license: pkg.license,
		version: pkg.version,
		main: argv.output + '/' + pkg.name + '.js'
	}, null, 2);

	return file('bower.json', json, {src: true})
		.pipe(gulp.dest('./'));
});

gulp.task('default', gulp.parallel('build'));
