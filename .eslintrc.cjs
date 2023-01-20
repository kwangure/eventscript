module.exports = {
	root: true,
	extends: [
		'@kwangure/eslint-config-svelte',
	],
	settings: {
		'import/resolver': {
			alias: {
				map: [
					// escape `$` to work around eslint's Regex matching
					['\\$app', './playground/node_modules/@sveltejs/kit/src/runtime/app/'],
					['\\$lib', './playground/src/lib/'],
					['\\$eventscript', './src/'],
				],
				extensions: ['.js', '.svelte', '.json'],
			},
		},
	},
	parserOptions: {
		ecmaVersion: 'latest',
	},
};
