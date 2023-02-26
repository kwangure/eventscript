import { NODE_CHILDREN, NODE_PARENT, NODE_SUBSCRIBERS, NODE_VALUE } from './esnode_constants.js';

/**
 * @typedef {import('./esnode').ESNode} ESNode
 */

/**
 * @param {ESNode} instance
 * @param {ESNode[]} nodes
 */
export function append(instance, ...nodes) {
	for (const node of nodes) {
		node[NODE_PARENT] = instance;
		instance[NODE_CHILDREN]?.add(node);
	}

	return nodes;
}

/**
 * @param {ESNode} instance
 * @param {ESNode[]} nodes
 */
export function remove(instance, ...nodes) {
	const deleted = [];
	for (const node of nodes) {
		if (instance[NODE_CHILDREN]?.delete(node)) {
			node[NODE_PARENT] = null;
			deleted.push(node);
		}
	}

	return deleted;
}
/**
 * @param {ESNode} node
 */
export function callSubscribers(node) {
	for (const subscriber of node[NODE_SUBSCRIBERS]) {
		subscriber(node);
	}
}

/**
 * @param {ESNode} node
 */
export function bubbleChange(node) {
	/** @type {ESNode | null} */
	let current = node;
	while (current !== null) {
		callSubscribers(current);
		current = current.parentNode;
	}
}

/**
 * @param {any} instance
 * @param {ESNode} type
 */
export function isESNodeType(instance, type) {
	try {
		return Object.is(instance.constructor, type);
	} catch (error) {
		return false;
	}
}

/**
 * @implements {ESNode}
 */
export class ESNaturalNumber {
	/** @type {Set<import('./esnode').ESNode>} */
	[NODE_CHILDREN] = new Set();

	/** @type {ESNode | null} */
	[NODE_PARENT] = null;

	/** @type {Set<(arg: this) => any>} */
	[NODE_SUBSCRIBERS] = new Set();

	/**
	 * @param {any} value
	 */
	constructor(value) {
		this[NODE_VALUE] = Number(value);
	}
	get parentNode() {
		return this[NODE_PARENT];
	}
	/**
	 * @param {any} value
	 */
	set(value) {
		const number = Math.max(Number(value), 0);
		if (this[NODE_VALUE] === number) return;
		this[NODE_VALUE] = number;
		bubbleChange(this);
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		this[NODE_SUBSCRIBERS].add(fn);
		fn(this);
		return () => this[NODE_SUBSCRIBERS].delete(fn);
	}
	toJSON() {
		return this[NODE_VALUE];
	}
	[Symbol.toPrimitive]() {
		return this[NODE_VALUE];
	}
}
