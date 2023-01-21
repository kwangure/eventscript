import { NODE_CHILDREN, NODE_PARENT, NODE_SUBSCRIBERS, NODE_VALUE } from './esnode_constants';
import { ESNode } from './esnode';

/**
 * @param {ESNode<any>} instance
 * @param {ESNode<any>[]} nodes
 */
export function append(instance, ...nodes) {
	for (const node of nodes) {
		node[NODE_PARENT] = instance;
		instance[NODE_CHILDREN].add(node);
	}

	return nodes;
}

/**
 * @param {ESNode<any>} instance
 * @param {ESNode<any>[]} nodes
 */
export function remove(instance, ...nodes) {
	const deleted = [];
	for (const node of nodes) {
		if (instance[NODE_CHILDREN].delete(node)) {
			node[NODE_PARENT] = null;
			deleted.push(node);
		}
	}

	return deleted;
}
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
		callSubscribers(current);
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
	} catch (error) {
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
	append() {
		return [];
	}
	remove() {
		return [];
	}
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
