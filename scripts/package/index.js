import { mkdirp, rimraf, write } from './filesystem.js';
import { emitFiles } from './typescript.js';
import fs from 'node:fs';
import { generagePackageJson } from './utils.js';
import path from 'node:path';

/**
 * @typedef {import('./types').Config} Config
 * @typedef {import('./types').File} File
 */

const essentialFiles = ['README', 'LICENSE', 'CHANGELOG', '.gitignore', '.npmignore'];
const cwd = process.cwd();
const input = path.join(cwd, 'src');
const output = path.join(cwd, 'dist');

/** @type {Config} */
const config = { cwd, input, output, included, exported };

/**
 * @param {string} file
 */
function included(file) {
	return (file.endsWith('.js') || file.endsWith('.d.ts'))
		&& !file.endsWith('.spec.js')
		&& !file.endsWith('.spec.d.ts')
		&& !file.endsWith('.test.js');
};

const indexRE = /(^|\/)index\.js/
/**
 * @param {string} file
 */
function exported(file) {
	return indexRE.test(file);
};

(async () => {
	rimraf(output);
	mkdirp(output);

	const files = await emitFiles(config);
	const pkg = generagePackageJson(files, config);
	write(path.join(output, 'package.json'), JSON.stringify(pkg, null, 4));

	const whitelist = fs.readdirSync(cwd).filter((file) => {
		const lowercased = file.toLowerCase();
		return essentialFiles.some((name) => lowercased.startsWith(name.toLowerCase()));
	});

	for (const pathname of whitelist) {
		const fullPath = path.join(cwd, pathname);
		if (fs.lstatSync(fullPath).isDirectory()) continue; // just to be sure

		const packagePath = path.join(output, pathname);
		if (!fs.existsSync(packagePath)) fs.copyFileSync(fullPath, packagePath);
	}

	const from = path.relative(cwd, input);
	const to = path.relative(cwd, output);

	console.log(`Package built successfully.\n\t${from} -> ${to}`);
})();
