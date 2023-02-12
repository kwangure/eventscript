import { NODE_PARENT, NODE_SUBSCRIBERS, NODE_VALUE } from './esnode_constants.js';
import { bubbleChange } from './esnodeutils.js';

/**
 * @typedef {import('./esnode').ESNode} ESNode
 */

/**
 * @implements {ESNode}
 */
export class ESBoolean {
	/** @type {ESNode | null} */
	[NODE_PARENT] = null;

	/** @type {Set<(arg: this) => any>} */
	[NODE_SUBSCRIBERS] = new Set();

	/**
	 * @param {any} value
	 */
	constructor(value) {
		this[NODE_VALUE] = Boolean(value);
	}
	/**
	 * @param {any} value
	 */
	set(value) {
		const boolean = Boolean(value);
		if (this[NODE_VALUE] === boolean) return;
		this[NODE_VALUE] = boolean;
		bubbleChange(this);
	}
	false() {
		this.set(false);
	}
	toggle() {
		this.set(!this[NODE_VALUE]);
	}
	true() {
		this.set(true);
	}
	toJSON() {
		return this[NODE_VALUE];
	}
	[Symbol.toPrimitive]() {
		return this[NODE_VALUE];
	}
	get parentNode() {
		return this[NODE_PARENT];
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		this[NODE_SUBSCRIBERS].add(fn);
		fn(this);
		return () => {
			this[NODE_SUBSCRIBERS].delete(fn);
		};
	}
}

/**
 * @param {any} value
 */
export function create(value) {
	return new ESBoolean(value);
}
