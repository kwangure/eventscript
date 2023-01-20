import { bubbleChange, isESNode } from "./esnodeutils";
import { ESNode } from "./esnode";
import { NODE_VALUE } from "./esnode_constants";

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

/**
 * @template T
 * @extends {ESNode<ESNode<T>[]>}
 */
export class ESArray extends ESNode {
	#length = new ESNaturalNumber(0);
	/**
	 * @param {ESNode<any>[]} [values]
	 */
	constructor(values = []) {
		super(values);

		this[NODE_VALUE] = values;
		this.#length.set(values.length);
		this.#length.subscribe((value) => {
			const array = this[NODE_VALUE];
			if (array.length === value) return;
			array.length = value;
		});
		this.append(this.#length, ...values);
	}
	/**
	 * @param {number} index
	 */
	at(index) {
		const array = this[NODE_VALUE];
		const value = array.at(index);
		super.set(array);
		return value;
	}
	get length() {
		return this.#length;
	}
	/**
	 * @param {ESNode<any>[]} values
	 */
	push(...values) {
		const array = this[NODE_VALUE];
		array.push(...values);

		super.append(...values);
		this.#length.set(array.length);
	}
	/**
	 * @returns {ESNode<any> | undefined}
	 */
	pop() {
		if (this[NODE_VALUE].length === 0) return;

		const value = this[NODE_VALUE].pop();
		// `value` could be undefined if array was grown using `array.length`
		if (isESNode(value)) {
			super.remove(value);
		}
		this.#length.set(this[NODE_VALUE].length);
		return value;
	}
	toJSON() {
		return this[NODE_VALUE].map((esnode) => esnode.toJSON());
	}
}
