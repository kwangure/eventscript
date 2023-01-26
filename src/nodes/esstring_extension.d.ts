import { ESString } from "./esstring.js";

declare module "./esstring.js" {
	interface ESString {
		at: String['at'],
		charAt: String['charAt'],
		charCodeAt: String['charCodeAt'],
		codePointAt: String['codePointAt'],
		includes: String['includes'],
		endsWith: String['endsWith'],
		indexOf: String['indexOf'],
		lastIndexOf: String['lastIndexOf'],
		localeCompare: String['localeCompare'],
		match: String['match'],
		matchAll: String['matchAll'],
		startsWith: String['startsWith'],
		valueOf: String['valueOf'],
	}
}

export function create(value: any): ESString
