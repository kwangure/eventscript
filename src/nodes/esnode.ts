import type { JsonValue } from "type-fest";
import { isESNodeType } from "./esnodeutils";

const _SET_PARENT = Symbol('set-parent');

export abstract class ESNode<T> {
	#children: Set<ESNode<any>> = new Set();
	#parentNode: ESNode<any> | null = null;
	#subscribers: Set<(arg: T) => any> = new Set();
	#value;
	constructor(value: T) {
		this.#value = value;
	}
	#callSubscribers() {
		for (const suscriber of this.#subscribers) {
			return suscriber(this.#value);
		}
	}
	get children() {
		return [...this.#children];
	}
	dispatchEvent(event: string, value: T): any {
		if (event === 'set') {
			this.#value = value;
			this.#callSubscribers();
		}
	}
	get() {
		return this.#value;
	}
	get parentNode() {
		return this.#parentNode;
	}
	set(value: T) {
		if (this.dispatchEvent !== ESNode.prototype.dispatchEvent) return;
		this.dispatchEvent('set', value);
	}
	subscribe(fn: (arg: T) => any) {
		this.#subscribers.add(fn);
		fn(this.#value);
		return () => this.#subscribers.delete(fn);
	}
	abstract toJSON() : JsonValue;
	append(...nodes: ESNode<any>[]): void {
		if (!nodes.length) return;

		for (const node of nodes) {
			node[_SET_PARENT](this);
			this.#children.add(node);
		}

		this.#callSubscribers();
	}
	remove(...nodes: ESNode<any>[]): void {
		if (!nodes.length) return;

		let deleted = 0;
		for (const node of nodes) {
			if (this.#children.delete(node)) {
				node[_SET_PARENT](null);
				deleted += 1
			}
		}

		if (deleted) this.#callSubscribers();
	}
	[_SET_PARENT](node: ESNode<any> | null): void {
		this.#parentNode = node;
		this.#callSubscribers();
	}
}
