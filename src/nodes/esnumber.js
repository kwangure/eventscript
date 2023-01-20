import { append, bubbleChange, callSubscribers, remove } from "./esnodeutils";
import { NODE_CHILDREN, NODE_VALUE } from "./esnode_constants";
import { ESNode } from "./esnode";

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
		this[NODE_CHILDREN] = new Set();
	}
	/**
	 * @param {ESNumber[]} nodes
	 */
	append(...nodes) {
		const appended = append(this, ...nodes);
		for (const node of appended) {
			callSubscribers(node);
		}
		bubbleChange(this);
		return nodes;
	}
	get children() {
		return [...this[NODE_CHILDREN]];
	}
	/**
	 * @param {ESNumber[]} nodes
	 */
	remove(...nodes) {
		const deleted = remove(this, ...nodes);
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
