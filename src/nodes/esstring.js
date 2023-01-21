import { bubbleChange } from './esnodeutils.js';
import { ESNode } from './esnode.js';
import { NODE_VALUE } from './esnode_constants.js';

/**
 * @extends {ESNode<string>}
 */
export class ESString extends ESNode {
	/**
	 * @param {any} value
	 */
	constructor(value) {
		const string = String(value);
		super(string);
		this[NODE_VALUE] = string;
	}
	/**
	 * @param {any} value
	 */
	set(value) {
		const string = String(value);
		if (this[NODE_VALUE] === string) return;
		super.set(string);
		bubbleChange(this);
	}
	toJSON() {
		return this[NODE_VALUE];
	}
	[Symbol.toPrimitive]() {
		return this[NODE_VALUE];
	}
}
