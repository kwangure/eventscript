import { ESNode } from "./esnode";

/**
 * @param {any} instance
 */
export function isESNode(instance) {
	return instance instanceof ESNode;
}

/**
 * @template {typeof ESNode<any>} T
 * @param {any} instance
 * @param {T} type
 */
export function isESNodeType(instance, type) {
	try {
		return Object.is(instance.constructor, type);
	} catch(e) {
		return false;
	}
}