import { bubbleChange, callSubscribers } from "./esnodeutils";
import { ESNode } from "./esnode";
import { NODE_VALUE } from "./esnode_constants";

/**
 * @extends {ESNode<number>}
 */
export class ESNumber extends ESNode {
	/**
	 * @param {any} value
	 */
	constructor(value) {
		const number = Number(value);
		super(number);
		this[NODE_VALUE] = number;
	}
	/**
	 * @param {ESNumber[]} nodes
	 */
	append(...nodes) {
		const appended = super.append(...nodes);
		for (const node of appended) {
			callSubscribers(node);
		}
		bubbleChange(this);
		return nodes;
	}
	/**
	 * @param {ESNumber[]} nodes
	 */
	remove(...nodes) {
		const deleted = super.remove(...nodes);
		if (deleted.length) {
			for (const node of deleted) {
				callSubscribers(node);
			}
			bubbleChange(this);
		}
		return deleted;
	}
	/**
	 * @param {any} value
	 */
	set(value) {
		const number = Number(value);
		if (this[NODE_VALUE] === number) return;
		super.set(number);
		bubbleChange(this);
	}
	toJSON() {
		return this[NODE_VALUE];
	}
	[Symbol.toPrimitive]() {
		return this[NODE_VALUE];
	}
}
