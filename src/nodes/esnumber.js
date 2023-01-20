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
	 * @param {ESNumber[]} nodes
	 */
	append(...nodes) {
		const appended = super.append(...nodes);
		for (const node of appended) {
			node.callSubscribers();
		}
		super.bubbleChange();
		return nodes;
	}
	/**
	 * @param {ESNumber[]} nodes
	 */
	remove(...nodes) {
		const deleted = super.remove(...nodes);
		if (deleted.length) {
			for (const node of deleted) {
				node.callSubscribers();
			}
			super.bubbleChange();
		}
		return deleted;
	}
	/**
	 * @param {any} value
	 */
	set(value) {
		const number = Number(value);
		if (super.get() === number) return;
		super.set(number);
		super.bubbleChange();
	}
	toJSON() {
		return super.get();
	}
 	[Symbol.toPrimitive]() {
		return super.get();
	}
}
