import type { JsonValue } from "type-fest";

const _SET_PARENT = Symbol('set-parent');

export abstract class ESNode<T> {
	#children: Set<ESNode<any>> = new Set();
	#parentNode: ESNode<any> | null = null;
	#subscribers: Set<(arg: T) => any> = new Set();
	#value;
	constructor(value: T) {
		this.#value = value;
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
		for (const suscriber of this.#subscribers) {
			return suscriber(this.#value);
		}
	}
	get children() {
		return [...this.#children];
	}
	set(value: T): any {
		this.#value = value;
	}
	get() {
		return this.#value;
	}
	get parentNode() {
		return this.#parentNode;
	}
	subscribe(fn: (arg: T) => any) {
		this.#subscribers.add(fn);
		fn(this.#value);
		return () => this.#subscribers.delete(fn);
	}
	abstract toJSON() : JsonValue;
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
