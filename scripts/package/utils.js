import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {string} string
 */
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * @param {import('./types').File[]} files
 * @param {import('./types').Config} config
 */
export function generagePackageJson(files, config) {
	const { cwd = process.cwd() } = config;
	const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));

	delete pkg.scripts;
	delete pkg.wireit

	pkg.type = 'module';
	pkg.exports = {
		'./package.json': './package.json',
	};

	const outputRE = new RegExp(`^${escapeRegExp(config.output)}`);
	const indexJSRE = /\/index\.js$/
	const jsExtensionRE = /.js$/;
	for (const file of files) {
		if (file.included && file.exported) {
			const entry = `.${file.dest.replace(outputRE, '')}`;
			const key = `${entry
				.replace(indexJSRE, '')
				.replace(jsExtensionRE, '')}`;

			if (!pkg.exports[key]) {
				pkg.exports[key] = entry;
			} else {
				throw new Error(
					`Duplicate "${key}" export. Please remove or rename either ${pkg.exports[key]} or ${entry}`
				);
			}
		}
	}

	return pkg;
}
