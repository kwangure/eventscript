import type { JsonValue } from "type-fest";
import { NODE_VALUE } from "./esnode_constants";

const _SET_PARENT = Symbol('set-parent');

export abstract class ESNode<T> {
	#children: Set<ESNode<any>> = new Set();
	#parentNode: ESNode<any> | null = null;
	#subscribers: Set<(arg: T) => any> = new Set();

	[NODE_VALUE]: T;

	constructor(value: T) {
		this[NODE_VALUE] = value;
	}
	bubbleChange() {
		/** @type {ESNode<any> | null} */
		let current;
		current = this;
		while (current !== null) {
			current.callSubscribers();
			current = current.parentNode;
		}
	}
	callSubscribers() {
		for (const subscriber of this.#subscribers) {
			subscriber(this[NODE_VALUE]);
		}
	}
	get children() {
		return [...this.#children];
	}
	// Use broad type to ease class subtyping
	set(...values: any[]): any {
		this[NODE_VALUE] = values[0] as T;
	}
	get() {
		return this[NODE_VALUE];
	}
	get parentNode() {
		return this.#parentNode;
	}
	subscribe(fn: (arg: T) => any) {
		this.#subscribers.add(fn);
		fn(this[NODE_VALUE]);
		return () => this.#subscribers.delete(fn);
	}
	abstract toJSON(): JsonValue;
	append(...nodes: ESNode<any>[]) {
		for (const node of nodes) {
			node[_SET_PARENT](this);
			this.#children.add(node);
		}

		return nodes;
	}
	remove(...nodes: ESNode<any>[]) {
		const deleted = [];
		for (const node of nodes) {
			if (this.#children.delete(node)) {
				node[_SET_PARENT](null);
				deleted.push(node);
			}
		}

		return deleted;
	}
	[_SET_PARENT](node: ESNode<any> | null): void {
		this.#parentNode = node;
	}
}
