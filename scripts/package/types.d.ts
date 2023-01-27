export interface Config {
	/** The input directory */
	input: string;
	/** The output directory */
	output: string;
	/** The working directory */
	cwd: string;
	/** Whether to include the file in the package */
	included: (filePath: string) => boolean;
	/** Whether add the file to the package.json exports field */
	exported: (filePath: string) => boolean;
}

export interface File {
	name: string;
	dest: string;
	base: string;
	included: boolean;
	exported: boolean;
}
