import path from 'node:path';
import ts from 'typescript';
import { write } from './filesystem.js';

/**
 * @param {import('./types').Config} config
 */
export async function emitFiles(config) {
	const parsedConfig = loadTsconfig(config);
	const program = ts.createProgram(parsedConfig.fileNames, {
		...parsedConfig.options,
		outDir: config.output,
		declaration: true, // Needed for d.ts file generation
		noEmit: false, // Set to true in case of jsconfig, force false, else nothing is emitted
	});
	const diagnostics = ts.getPreEmitDiagnostics(program);

	/**
	 * @type {import('./types').File[]}
	 */
	const files = [];
	if (diagnostics.length === 0) {
		program.emit(undefined, (outputFilePath, code) => {
			if (!config.included(outputFilePath)) return;
			const base = outputFilePath.slice(0, -path.extname(outputFilePath).length);
			files.push({
				name: outputFilePath.replace(config.output, config.input),
				dest: outputFilePath,
				base,
				included: true,
				exported: config.exported(outputFilePath),
			})
			write(outputFilePath, code);
		});
	} else {
		diagnostics.forEach((diagnostic) => {
			const { file, start } = diagnostic;
			if (file) {
				const { line, character } = ts
					.getLineAndCharacterOfPosition(file, /** @type {number} */(start));
				const message = ts
					.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
				const fileName = file.fileName.replace(config.cwd, '');
				console.log(`> ${fileName}:${line + 1}:${character + 1}\n${message}`);
			} else {
				console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
			}
		});
		process.exit(1);
	}
	return files;
}

/**
 * @param {import('./types').Config} config
 */
function loadTsconfig(config) {
	const libRoot = config.cwd;

	const jsconfigFile = ts.findConfigFile(config.input, ts.sys.fileExists, 'jsconfig.json');
	let tsconfigFile = jsconfigFile || ts.findConfigFile(libRoot, ts.sys.fileExists);

	if (!tsconfigFile) {
		throw new Error('Failed to locate tsconfig or jsconfig');
	}

	const { error, config: tsConfig } = ts.readConfigFile(tsconfigFile, ts.sys.readFile);

	if (error) {
		throw new Error('Malformed tsconfig\n' + JSON.stringify(error, null, 2));
	}

	const basepath = path.dirname(tsconfigFile);
	// Rewire includes and files. This ensures that only the files inside the lib are traversed and
	// that the outputted types have the correct directory depth.
	// This is a little brittle because we then may include more than the user wants
	const libPathRelative = path.relative(basepath, config.input).split(path.sep).join('/');
	if (libPathRelative) {
		tsConfig.include = [`${libPathRelative}/**/*`];
		tsConfig.files = [];
	}

	const { options, fileNames } = ts.parseJsonConfigFileContent(
		tsConfig,
		ts.sys,
		config.input,
		{ sourceMap: false },
		tsconfigFile,
	);

	return { options, fileNames };
}
