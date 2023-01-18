import { isESNodeType } from "./esnodeutils";

/**
 * @template T
 */
export class ESNode {
	/** @type {Set<(arg0: T) => any>} */
	#subscribers = new Set();
	#value;
	/**
	 * @param {T} value
	 */
	constructor(value) {
		this.#value = value;
	}
	#callSubscribers() {
		for (const suscriber of this.#subscribers) {
			return suscriber(this.#value);
		}
	}
	/**
	 * @param {string} event
	 * @param {T} value
	 */
	dispatchEvent(event, value) {
		if (event === 'set') {
			this.#value = value;
			this.#callSubscribers();
		}
	}
	/**
	 * @param {T} value
	 */
	set(value) {
		if (!isESNodeType(this, ESNode)) return;
		this.dispatchEvent('set', value);
	}
	/**
	 * @param {(arg0: T) => any} fn
	 */
	subscribe(fn) {
		this.#subscribers.add(fn);
		fn(this.#value);
		return () => this.#subscribers.delete(fn);
	}
	valueOf() {
		return this.#value;
	}
	toJSON() {
		return this.valueOf();
	}
}
