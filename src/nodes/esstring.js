import { NODE_PARENT, NODE_SUBSCRIBERS, NODE_VALUE } from './esnode_constants.js';
import { bubbleChange } from './esnodeutils.js';

/**
 * @typedef {import('./esnode').ESNode} ESNode
 */

/**
 * @implements {ESNode}
 */
export class ESString {
	/** @type {ESNode | null} */
	[NODE_PARENT] = null;

	/** @type {Set<(arg: this) => any>} */
	[NODE_SUBSCRIBERS] = new Set();

	[NODE_VALUE] = '';

	/**
	 * @param {any} value
	 */
	constructor(value) {
		this[NODE_VALUE] = String(value);
	}
	get parentNode() {
		return this[NODE_PARENT];
	}
	/**
	 * @param {any} value
	 */
	set(value) {
		const string = String(value);
		if (this[NODE_VALUE] === string) return;
		this[NODE_VALUE] = string;
		bubbleChange(this);
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		this[NODE_SUBSCRIBERS].add(fn);
		fn(this);
		return () => {
			this[NODE_SUBSCRIBERS].delete(fn);
		};
	}
	toJSON() {
		return this[NODE_VALUE];
	}
	[Symbol.iterator]() {
		return this[NODE_VALUE][Symbol.iterator]();
	}
	[Symbol.toPrimitive]() {
		return this[NODE_VALUE];
	}
}

const STRING_METHODS = 'at charAt charCodeAt codePointAt includes endsWith indexOf lastIndexOf localeCompare match matchAll startsWith valueOf'.split(' ');

STRING_METHODS.forEach((method) => {
	// @ts-ignore
	// eslint-disable-next-line func-names
	ESString.prototype[method] = function (...args) {
		// @ts-ignore
		return String.prototype[method].call(this[NODE_VALUE], ...args);
	};
});

/**
 * @param {any} value
 */
export function create(value) {
	return new ESString(value);
}
