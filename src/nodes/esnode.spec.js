import { describe, expect, it } from 'vitest';
import { ESNode } from './esnode';

/**
 * @typedef {import('type-fest').JsonValue} JsonValue
 */

/**
 * @template T
 * @extends {ESNode<T>}
 */
class ESNewNode extends ESNode {
	toJSON() {
		return /** @type {JsonValue} */(super.get());
	}
}

describe('ESNode', () => {
	it('returns untransformed values', () => {
		const node = new ESNewNode('3');
		expect(node.get()).toBe('3');

		const node2 = new ESNewNode(3);
		expect(node2.get()).toBe(3);
	});

	it('sets number', () => {
		const node = new ESNewNode('3');
		expect(node.get()).toBe('3');

		node.set('4');
		expect(node.get()).toBe('4');
	});

	it.todo('calls subsbribers', () => {

	});

	it.todo('removes child from old parent before appending to new parent', () => {

	});
});
