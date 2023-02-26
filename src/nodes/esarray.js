import { append, ESNaturalNumber, remove } from './esnodeutils.js';
import { NODE_CHILDREN, NODE_PARENT, NODE_SUBSCRIBERS, NODE_VALUE } from './esnode_constants.js';

/**
 * @typedef {import('./esnode').ESNode} ESNode
 */

/**
 * @template {ESNode} T
 * @implements {ESNode}
 */
export class ESArray {
	#length = new ESNaturalNumber(0);
	[NODE_CHILDREN] = new Set();
	/** @type {ESNode | null} */
	[NODE_PARENT] = null;
	/** @type {Set<(arg: this) => any>} */
	[NODE_SUBSCRIBERS] = new Set();
	/**
	 * @param {Iterable<T>} [values]
	 */
	constructor(values) {
		const array = [...values || []];

		this[NODE_VALUE] = array;

		this.#length.set(array.length);
		this.#length.subscribe((value) => {
			if (array.length === Number(value)) return;
			array.length = Number(value);
		});

		append(this, this.#length, ...array);
	}
	/**
	 * @param {number} index
	 */
	at(index) {
		return this[NODE_VALUE].at(index);
	}
	get length() {
		return this.#length;
	}
	get parentNode() {
		return this[NODE_PARENT];
	}
	/**
	 * @returns {T | undefined}
	 */
	pop() {
		if (this[NODE_VALUE].length === 0) return;

		const value = this[NODE_VALUE].pop();
		// `value` could be undefined if array was grown using `array.length`
		if (value !== undefined) {
			remove(this, value);
		}
		this.#length.set(this[NODE_VALUE].length);
		return value;
	}
	/**
	 * @param {T[]} values
	 */
	push(...values) {
		const array = this[NODE_VALUE];
		array.push(...values);

		append(this, ...values);
		this.#length.set(array.length);
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
		// JSON.stringify serializes empty slots and undefined in Array to null
		const array = this[NODE_VALUE];
		const json = Array(array.length).fill(null);
		// TODO: Should we do input validation in setters so that we can assume ESNodes here
		// or should we rely on TypeScript. Validation probably.
		// Foreach skips empty slots.
		array.forEach((item, index) => {
			json[index] = item.toJSON();
		});
		return json;
	}
	[Symbol.iterator]() {
		return this[NODE_VALUE][Symbol.iterator]();
	}
}

/**
 * @template {ESNode} T
 * @param {Iterable<T>} value
 */
export function create(value) {
	return new ESArray(value);
}
