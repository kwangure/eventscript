import { append, ESNaturalNumber, isESNode, remove } from './esnodeutils.js';
import { NODE_CHILDREN, NODE_VALUE } from './esnode_constants.js';
import { ESNode } from './esnode.js';

/**
 * @template {ESNode<any>} T
 * @extends {ESNode<(T extends ESNode<infer U> ? ESNode<U> : T)[]>}
 */
export class ESArray extends ESNode {
	#length = new ESNaturalNumber(0);
	/**
	 * @param {Iterable<T extends ESNode<infer U> ? ESNode<U>: T>} [values]
	 */
	constructor(values) {
		const array = [...values || []];
		super(array);

		this[NODE_VALUE] = array;
		/** @type {Set<ESNode<T>>} */
		this[NODE_CHILDREN] = new Set();

		this.#length.set(array.length);
		this.#length.subscribe((value) => {
			const array = this[NODE_VALUE];
			if (array.length === value) return;
			array.length = value;
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
	/**
	 * @param {(T extends ESNode<infer U> ? ESNode<U> : T)[]} values
	 */
	push(...values) {
		const array = this[NODE_VALUE];
		array.push(...values);

		append(this, ...values);
		this.#length.set(array.length);
	}
	/**
	 * @returns {(T extends ESNode<infer U> ? ESNode<U> : T) | undefined}
	 */
	pop() {
		if (this[NODE_VALUE].length === 0) return;

		const value = this[NODE_VALUE].pop();
		// `value` could be undefined if array was grown using `array.length`
		if (isESNode(value)) {
			remove(this, value);
		}
		this.#length.set(this[NODE_VALUE].length);
		return value;
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
 * @template {ESNode<any>} T
 * @param {Iterable<T extends ESNode<infer U> ? ESNode<U>: T>} value
 */
export function create(value) {
	return new ESArray(value);
}
