import { ESNaturalNumber } from "./esnodeutils";
import { ESNode } from "./esnode";
import { NODE_VALUE } from "./esnode_constants";

/**
 * @template {string | number} K
 * @template T
 * @extends {ESNode<Map<K, ESNode<T>>>}
 */
export class ESMap extends ESNode {
	#size = new ESNaturalNumber(0);
	/**
	 * @param {Iterable<[K, ESNode<any>]>} [values]
	 */
	constructor(values = []) {
		const map = new Map(values)
		super(map);

		this[NODE_VALUE] = map;
		this.#size.set(map.size);
		this.#size.subscribe((value) => {
			if (this[NODE_VALUE].size === value) return;
			// TODO: Guard against changing size without calling subscribers
			this.#size.set(this[NODE_VALUE].size);
		});
		this.append(this.#size, ...map.values());
	}
	/**
	 * @param {K} key
	 */
	delete(key) {
		const value = this[NODE_VALUE].get(key);
		const isDeleted = this[NODE_VALUE].delete(key);
		if (isDeleted && value) {
			super.remove(value);
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
	 * @param {ESNode<any>} value
	 */
	set(key, value) {
		this[NODE_VALUE].set(key, value);
		super.append(value);
		this.#size.set(this[NODE_VALUE].size);
		return this;
	}
	get size() {
		return this.#size;
	}
	toJSON() {
		/** @type {Record<string | number, import("type-fest").JsonValue>} */
		const json = {};
		for (const [key, value] of this[NODE_VALUE]) {
			json[key] = value.toJSON();
		}
		return json;
	}
}
