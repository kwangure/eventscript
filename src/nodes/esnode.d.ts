import { NODE_CHILDREN, NODE_PARENT, NODE_SUBSCRIBERS, NODE_VALUE } from "./esnode_constants";
import type { JsonValue } from "type-fest";

export abstract class ESNode<T> {
	[NODE_CHILDREN]: Set<ESNode<any>>;
	[NODE_PARENT]: ESNode<any> | null = null;
	[NODE_SUBSCRIBERS]: Set<(arg: T) => any> = new Set();
	[NODE_VALUE]: T;

	constructor();
	// Use broad type to ease class subtyping
	set(...values: any[]): any
	get parentNode(): ESNode<any> | null;
	subscribe(fn: (arg: T) => any): () => boolean;
	abstract toJSON(): JsonValue;
}
