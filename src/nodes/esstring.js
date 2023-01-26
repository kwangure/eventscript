import { bubbleChange } from './esnodeutils.js';
import { ESNode } from './esnode.js';
import { NODE_VALUE } from './esnode_constants.js';

/**
 * @extends {ESNode<string>}
 */
export class ESString extends ESNode {
	/**
	 * @param {any} value
	 */
	constructor(value) {
		const string = String(value);
		super(string);
		this[NODE_VALUE] = string;
	}
	/**
	 * @param {any} value
	 */
	set(value) {
		const string = String(value);
		if (this[NODE_VALUE] === string) return;
		super.set(string);
		bubbleChange(this);
	}
	toJSON() {
		return this[NODE_VALUE];
	}
	[Symbol.toPrimitive]() {
		return this[NODE_VALUE];
	}
	[Symbol.iterator]() {
		return this[NODE_VALUE][Symbol.iterator]();
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
