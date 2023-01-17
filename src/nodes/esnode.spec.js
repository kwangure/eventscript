import { describe, expect, it } from 'vitest';
import { ESNode } from './esnode';

describe('ESNode', () => {
	it('returns untransformed values', () => {
		const value1 = '5';
		const node = new ESNode(value1);
		expect(node.valueOf()).toBe(value1);

		const value2 = 5;
		const node2 = new ESNode(value2);
		expect(node2.valueOf()).toBe(value2);
	});

	it('rejects unclonable values', () => {
		expect(() =>  new ESNode(Symbol('test'))).toThrowError(/serializable/);
	});

	it('does not reference original value', () => {
		const value = { five: 5 };
		const node3 = new ESNode(value);
		expect(node3.valueOf()).not.toBe(value);
	});

	it.todo('sets new value', () => {

	});

	it.todo('calls subsbribers', () => {

	});
});
