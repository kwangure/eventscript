import { copy, mkdirp, rimraf, walk, write } from './filesystem.js';
import fs from 'node:fs';
import { generagePackageJson } from './utils.js';
import path from 'node:path';

const essential_files = ['README', 'LICENSE', 'CHANGELOG', '.gitignore', '.npmignore'];
const cwd = process.cwd();
const input = path.join(cwd, 'src');
const output = path.join(cwd, 'dist');

function includes(file) {
	return file.endsWith('.js')
		&& !file.endsWith('.spec.js')
		&& !file.endsWith('.test.js');
};

function exports(file) {
	return file.endsWith('/index.js');
};

(async () => {
	rimraf(output);
	mkdirp(output);

	const files = walk(input)
		.map((file) => ({
			name: file,
			dest: file,
			included: includes(file),
			exported: exports(file),
		}));
	const pkg = generagePackageJson(files, { cwd });

	write(path.join(output, 'package.json'), JSON.stringify(pkg, null, 4));

	for (const file of files) {
		await processFile(file);
	}

	const whitelist = fs.readdirSync(cwd).filter((file) => {
		const lowercased = file.toLowerCase();
		return essential_files.some((name) => lowercased.startsWith(name.toLowerCase()));
	});

	for (const pathname of whitelist) {
		const full_path = path.join(cwd, pathname);
		if (fs.lstatSync(full_path).isDirectory()) continue; // just to be sure

		const package_path = path.join(output, pathname);
		if (!fs.existsSync(package_path)) fs.copyFileSync(full_path, package_path);
	}

	const from = path.relative(cwd, input);
	const to = path.relative(cwd, output);

	console.log(`Package built successfully.\n\t${from} -> ${to}`);
})();

async function processFile(file) {
	if (!file.included) return;

	const filename = path.join(input, file.name);
	const dest = path.join(output, file.dest);

	if (file.is_svelte || file.name.endsWith('.ts')) {
		let contents = fs.readFileSync(filename, 'utf-8');

		if (file.is_svelte) {
			if (config.preprocess) {
				const preprocessed = (await preprocess(contents, config.preprocess, { filename })).code;
				contents = strip_lang_tags(preprocessed);
			}
		}

		if (file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) {
			contents = await transpile_ts(filename, contents);
		}

		contents = resolve_lib_alias(file.name, contents, config);
		write(dest, contents);
	} else {
		copy(filename, dest);
	}
}
