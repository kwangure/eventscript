import fs from 'node:fs';
import path from 'node:path';

export function generagePackageJson(files, options) {
	const { cwd = process.cwd() } = options;
	const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));

	delete pkg.scripts;
	delete pkg.wireit

	pkg.type = 'module';
	pkg.exports = {
		'./package.json': './package.json',
	};


	for (const file of files) {
		if (file.included && file.exported) {
			const entry = `./${file.dest}`;
			const key = entry.replace(/\/index\.js$|(\/[^/]+)\.js$/, '$1');

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
