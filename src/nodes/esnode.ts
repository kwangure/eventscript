import { NODE_CHILDREN, NODE_PARENT, NODE_SUBSCRIBERS, NODE_VALUE } from "./esnode_constants";
import type { JsonValue } from "type-fest";

export abstract class ESNode<T> {
	// @ts-expect-error
	[NODE_CHILDREN]: Set<ESNode<any>>;
	[NODE_PARENT]: ESNode<any> | null = null;
	[NODE_SUBSCRIBERS]: Set<(arg: T) => any> = new Set();
	[NODE_VALUE]: T;

	constructor(value: T) {
		this[NODE_VALUE] = value;
	}
	// Use broad type to ease class subtyping
	set(...values: any[]): any {
		this[NODE_VALUE] = values[0] as T;
	}
	get parentNode() {
		return this[NODE_PARENT];
	}
	subscribe(fn: (arg: T) => any) {
		this[NODE_SUBSCRIBERS].add(fn);
		fn(this[NODE_VALUE]);
		return () => this[NODE_SUBSCRIBERS].delete(fn);
	}
	abstract toJSON(): JsonValue;
}
