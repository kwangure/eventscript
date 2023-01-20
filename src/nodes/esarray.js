import { ESNode } from "./esnode";
import { isESNode } from "./esnodeutils";

/**
 * @extends {ESNode<number>}
 */
export class ESNaturalNumber extends ESNode {
	/**
	 * @param {any} value
	 */
	constructor(value) {
		super(Number(value));
	}
	append() { return []; }
	bubbleChange() {}
	remove() { return []; }
	/**
	 * @param {any} value
	 */
	set(value) {
		const number = Math.max(Number(value), 0);
		if (super.get() === number) return;
		super.set(number);
		super.bubbleChange();
	}
	toJSON() {
		return super.get();
	}
 	[Symbol.toPrimitive]() {
		return super.get();
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

		this.#length.set(values.length);
		this.#length.subscribe((value) => {
			const array = super.get();
			if (array.length === value) return;
			array.length = value;
		});
		this.append(this.#length, ...values);
	}
	/**
	 * @param {number} index
	 */
	at(index) {
		const array = super.get();
		const value = array.at(index);
		super.set(array);
		return value;
	}
	get() {
		return [...super.get()];
	}
	get length() {
		return this.#length;
	}
	/**
	 * @param {ESNode<any>[]} values
	 */
	push(...values) {
		const array = super.get();
		array.push(...values);

		super.append(...values);
		this.#length.set(array.length);
	}
	/**
	 * @returns {ESNode<any> | undefined}
	 */
	pop() {
		const array = super.get();
		if (array.length === 0) return;

		const value = array.pop();
		// `value` could be undefined if array was grown using `array.length`
		if (isESNode(value)) {
			super.remove(value);
		}
		this.#length.set(array.length);
		return value;
	}
	toJSON() {
		return super.get().map((esnode) => esnode.toJSON());
	}
}
