import { NODE_SUBSCRIBERS, NODE_VALUE } from "./esnode_constants";
import type { JsonValue } from "type-fest";

const _SET_PARENT = Symbol('set-parent');

export abstract class ESNode<T> {
	#children: Set<ESNode<any>> = new Set();
	#parentNode: ESNode<any> | null = null;

	[NODE_SUBSCRIBERS]: Set<(arg: T) => any> = new Set();
	[NODE_VALUE]: T;

	constructor(value: T) {
		this[NODE_VALUE] = value;
	}
	get children() {
		return [...this.#children];
	}
	// Use broad type to ease class subtyping
	set(...values: any[]): any {
		this[NODE_VALUE] = values[0] as T;
	}
	get parentNode() {
		return this.#parentNode;
	}
	subscribe(fn: (arg: T) => any) {
		this[NODE_SUBSCRIBERS].add(fn);
		fn(this[NODE_VALUE]);
		return () => this[NODE_SUBSCRIBERS].delete(fn);
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
