import { NODE_PARENT, NODE_SUBSCRIBERS, NODE_VALUE } from './esnode_constants.js';

/**
 * @template T
 */
export class ESNode {
	/** @type {ESNode<any> | null} */
	[NODE_PARENT] = null;
	/** @type {Set<(arg: T) => any>} */
	[NODE_SUBSCRIBERS] = new Set();

	/** @param {T} */
	constructor(value) {
		this[NODE_VALUE] = value;
	}
	// Use broad type to ease class subtyping
	set(...values) {
		this[NODE_VALUE] = values[0];
	}
	get parentNode() {
		return this[NODE_PARENT];
	}
	subscribe(fn) {
		this[NODE_SUBSCRIBERS].add(fn);
		fn(this[NODE_VALUE]);
		return () => this[NODE_SUBSCRIBERS].delete(fn);
	}
}
