import { ESNode } from "./esnode.js";

/**
 * @extends {ESNode<number>}
 */
export class ESNumber extends ESNode {
	/**
	 * @param {any} value
	 */
	constructor(value) {
		super(Number(value));
	}
	/**
	 * @param {string} event
	 * @param {any} value
	 */
	dispatchEvent(event, value) {
		super.dispatchEvent(event, Number(value))
	}
 	[Symbol.toPrimitive]() {
		return this.valueOf();
	}
}
