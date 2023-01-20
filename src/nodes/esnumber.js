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
	 * @param {any} value
	 */
	set(value) {
		const number = Number(value);
		if (super.get() === number) return;
		super.set(number);
	}
	toJSON() {
		return super.get();
	}
 	[Symbol.toPrimitive]() {
		return super.get();
	}
}
