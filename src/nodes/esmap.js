import { append, ESNaturalNumber, remove } from './esnodeutils.js';
import { NODE_CHILDREN, NODE_PARENT, NODE_SUBSCRIBERS, NODE_VALUE } from './esnode_constants.js';

/**
 * @typedef {import('./esnode').ESNode} ESNode
 */

/**
 * @template {string | number} K
 * @template {ESNode} T
 * @implements {ESNode}}
 */
export class ESMap {
	[NODE_CHILDREN] = new Set();

	/** @type {ESNode | null} */
	[NODE_PARENT] = null;

	/** @type {Set<(arg: this) => any>} */
	[NODE_SUBSCRIBERS] = new Set();

	#size = new ESNaturalNumber(0);
	/**
	 * @param {Iterable<[K, T]>} [values]
	 */
	constructor(values = []) {

		const map = new Map(values);

		this[NODE_VALUE] = map;

		this.#size.set(map.size);
		this.#size.subscribe((value) => {
			if (map.size === Number(value)) return;
			// TODO: Guard against changing size without calling subscribers
			this.#size.set(map.size);
		});

		append(this, this.#size, ...map.values());
	}
	/**
	 * @param {K} key
	 */
	delete(key) {
		const value = this[NODE_VALUE].get(key);
		const isDeleted = this[NODE_VALUE].delete(key);
		if (isDeleted && value) {
			remove(this, value);
		}
		this.#size.set(this[NODE_VALUE].size);
		return isDeleted;
	}
	/**
	 * @param {K} key
	 */
	get(key) {
		return this[NODE_VALUE].get(key);
	}
	/**
	 * @param {K} key
	 * @param {T} value
	 */
	set(key, value) {
		this[NODE_VALUE].set(key, value);
		append(this, value);
		this.#size.set(this[NODE_VALUE].size);
		return this;
	}
	get size() {
		return this.#size;
	}
	toJSON() {
		/** @type {Record<string | number, import('type-fest').JsonValue>} */
		const json = {};
		for (const [key, value] of this[NODE_VALUE]) {
			json[key] = value.toJSON();
		}
		return json;
	}
	[Symbol.iterator]() {
		return this[NODE_VALUE][Symbol.iterator]();
	}
	keys() {
		return this[NODE_VALUE].keys();
	}
	values() {
		return this[NODE_VALUE].values();
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
 * @template {ESNode} T
 * @param {{
 * 		[k: string | number]:  T
 * }} value
 */
export function create(value) {
	return new ESMap(Object.entries(value));
}
