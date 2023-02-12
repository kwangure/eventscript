import { NODE_CHILDREN, NODE_PARENT, NODE_SUBSCRIBERS } from './esnode_constants.js';
import type { JsonValue } from "type-fest";

export interface Subscriber<T extends ESNode> {
	(arg: T): any
}

export interface ESNode {
	[NODE_CHILDREN]?: Set<ESNode>;
	[NODE_PARENT]: ESNode | null;
	[NODE_SUBSCRIBERS]: Set<Subscriber>;
	get parentNode(): ESNode | null;
	toJSON(): JsonValue;
	subscribe(fn: Subscriber): () => void
}
