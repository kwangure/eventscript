module.exports = {
	root: true,
	extends: [
		'@kwangure/eslint-config-svelte',
	],
	plugins: ['sort-class-members'],
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
	rules: {
		'sort-class-members/sort-class-members': [
			2,
			{
				groups: {
					'computed-methods': [{
						type: 'method',
						sort: 'alphabetical',
						name: '/\\[.*\\]/',
					}],
					'methods': [{
						type: 'method',
						sort: 'alphabetical',
					}],
					'private-methods': [{
						type: 'method',
						private: true,
						sort: 'alphabetical',
					}],
					'private-properties': [{
						type: 'property',
						private: true,
						sort: 'alphabetical',
					}],
				},
				order: [
					'[private-properties]',
					'[properties]',
					'constructor',
					'[private-methods]',
					'[methods]',
					'[computed-methods]',
					'[everything-else]',
				],
				accessorPairPositioning: 'getThenSet',
			},
		],
	},
};
