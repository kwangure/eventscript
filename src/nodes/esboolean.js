import { bubbleChange } from './esnodeutils.js';
import { ESNode } from './esnode.js';
import { NODE_VALUE } from './esnode_constants.js';

/**
 * @extends {ESNode<boolean>}
 */
export class ESBoolean extends ESNode {
	/**
	 * @param {any} value
	 */
	constructor(value) {
		const boolean = Boolean(value);
		super(boolean);
		this[NODE_VALUE] = boolean;
	}
	/**
	 * @param {any} value
	 */
	set(value) {
		const boolean = Boolean(value);
		if (this[NODE_VALUE] === boolean) return;
		super.set(boolean);
		bubbleChange(this);
	}
	false() {
		this.set(false);
	}
	toggle() {
		this.set(!this[NODE_VALUE]);
	}
	true() {
		this.set(true);
	}
	toJSON() {
		return this[NODE_VALUE];
	}
	[Symbol.toPrimitive]() {
		return this[NODE_VALUE];
	}
}