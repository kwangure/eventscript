import { ESNode } from "./esnode";

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
		const number = Number(value);
		if (event === 'set') {
			if (super.get() === number) return;
			super.dispatchEvent(event, number);
		}
	}
	toJSON() {
		return super.get();
	}
 	[Symbol.toPrimitive]() {
		return super.get();
	}
}
