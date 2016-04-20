module.exports = function(config) {
	var configuration = {
		browsers: ['Firefox'],
		files: ['./node_modules/Chart.js/dist/Chart.js', './node_modules/Chart.js/test/mockContext.js', './src/**/*.js', './test/**/*.js'],
		frameworks: ['jasmine'],

		preprocessors: {
			'./src/**/*.js': ['coverage']
		},
		
		reporters: ['progress', 'coverage'],
		coverageReporter: {
			dir: 'coverage/',
			reporters: [
				{ type: 'html', subdir: 'report-html' },
				{ type: 'lcovonly', subdir: '.', file: 'lcov.info' },
			]
		}
	};

	// If on the CI, use the CI chrome launcher
	if (process.env.TRAVIS) {
		configuration.browsers.push('Chrome_travis_ci');
		configuration.customLaunchers = {
			Chrome_travis_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		};
	} else {
		configuration.browsers.push('Chrome');
	}

	config.set(configuration);
};