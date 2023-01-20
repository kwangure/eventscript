import { NODE_SUBSCRIBERS, NODE_VALUE } from "./esnode_constants";
import { ESNode } from "./esnode";

/**
 * @param {ESNode<any>} node
 */
export function callSubscribers(node) {
	for (const subscriber of node[NODE_SUBSCRIBERS]) {
		subscriber(node[NODE_VALUE]);
	}
}

/**
 * @param {ESNode<any>} node
 */
export function bubbleChange(node) {
	/** @type {ESNode<any> | null} */
	let current = node;
	while (current !== null) {
		callSubscribers(current)
		current = current.parentNode;
	}
}

/**
 * @template T
 * @param {T} instance
 * @returns {instance is T & ESNode<any>}
 */
export function isESNode(instance) {
	return instance instanceof ESNode;
}

/**
 * @template {typeof ESNode<any>} T
 * @param {any} instance
 * @param {T} type
 */
export function isESNodeType(instance, type) {
	try {
		return Object.is(instance.constructor, type);
	} catch (e) {
		return false;
	}
}

/**
* @extends {ESNode<number>}
*/
export class ESNaturalNumber extends ESNode {
	/**
	 * @param {any} value
	 */
	constructor(value) {
		const number = Number(value);
		super(number);
		this[NODE_VALUE] = number;
	}
	append() { return []; }
	remove() { return []; }
	/**
	 * @param {any} value
	 */
	set(value) {
		const number = Math.max(Number(value), 0);
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
