import { append, ESNaturalNumber, isESNode, remove } from './esnodeutils';
import { NODE_CHILDREN, NODE_VALUE } from './esnode_constants';
// eslint-disable-next-line import/no-unresolved
import { ESNode } from './esnode';

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
		/** @type {Set<ESNode<any>>} */
		this[NODE_CHILDREN] = new Set();

		this.#length.set(values.length);
		this.#length.subscribe((value) => {
			const array = this[NODE_VALUE];
			if (array.length === value) return;
			array.length = value;
		});
		append(this, this.#length, ...values);
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

		append(this, ...values);
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
			remove(this, value);
		}
		this.#length.set(this[NODE_VALUE].length);
		return value;
	}
	toJSON() {
		return this[NODE_VALUE].map((esnode) => esnode.toJSON());
	}
}
