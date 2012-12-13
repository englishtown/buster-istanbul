module.exports['test'] = {
	environment: 'browser',
	//environment: 'node',
	rootPath: './',
	libs: [
		'scripts/lib/when/when.js'
	],
	sources: ['scripts/src/**/*.js'],
	tests: ['test/*-test.js'],
	resources: ['scripts/src/**/*.js'],
	extensions: [
		require('buster-istanbul')
		,require('buster-amd')
	],
	options: {
		amd: {
			require: 'scripts/lib/require.js',
			config: 'scripts/config.require.js'
		}
	}
};