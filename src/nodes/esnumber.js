import { bubbleChange } from './esnodeutils.js';
import { ESNode } from './esnode.js';
import { NODE_VALUE } from './esnode_constants.js';

/**
 * @extends {ESNode<number>}
 */
export class ESNumber extends ESNode {
	/**
	 * @param {any} value
	 */
	constructor(value) {
		super();

		this[NODE_VALUE] = Number(value);
	}
	/**
	 * @param {any} value
	 */
	set(value) {
		const number = Number(value);
		if (this[NODE_VALUE] === number) return;
		this[NODE_VALUE] = number;
		bubbleChange(this);
	}
	toJSON() {
		return this[NODE_VALUE];
	}
	[Symbol.toPrimitive]() {
		return this[NODE_VALUE];
	}
}

/**
 * @param {any} value
 */
export function create(value) {
	return new ESNumber(value);
}
