import { describe, expect, it } from 'vitest';
import { callSubscribers } from './esnodeutils';
import { ESNode } from './esnode';

/**
 * @typedef {import('type-fest').JsonValue} JsonValue
 */

/**
 * @template T
 * @extends {ESNode<T>}
 */
class ESNewNode extends ESNode {
	/**
	 * @param {any} value
	 */
	set(value) {
		super.set(value);
		callSubscribers(this);
	}
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

	it('calls subsbribers', () => {
		const node = new ESNewNode('3');

		let value1;
		const unsubscribe1 = node.subscribe((value) => value1 = value);
		let value2;
		const unsubscribe2 = node.subscribe((value) => value2 = value);
		let value3;
		const unsubscribe3 = node.subscribe((value) => value3 = value);
		expect(value1).toBe('3');
		expect(value2).toBe('3');
		expect(value3).toBe('3');

		node.set(4);
		expect(value1).toBe(4);
		expect(value2).toBe(4);
		expect(value3).toBe(4);

		unsubscribe3();
		node.set(null);
		expect(value1).toBe(null);
		expect(value2).toBe(null);
		expect(value3).toBe(4);

		unsubscribe2();
		node.set('3');
		expect(value1).toBe('3');
		expect(value2).toBe(null);
		expect(value3).toBe(4);

		unsubscribe1();
		node.set(100);
		expect(value1).toBe('3');
		expect(value2).toBe(null);
		expect(value3).toBe(4);
	});

	it.todo('removes child from old parent before appending to new parent', () => {

	});
});
