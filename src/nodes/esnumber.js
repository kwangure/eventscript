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
		const number = Number(value);
		super(number);
		this[NODE_VALUE] = number;
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
