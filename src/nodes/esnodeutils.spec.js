import { describe, expect, it } from 'vitest';
import { isESNode, isESNodeType } from './esnodeutils';
// eslint-disable-next-line import/no-unresolved
import { ESNode } from './esnode';
import { ESNumber } from './esnumber';
import { NODE_VALUE } from './esnode_constants';

/**
 * @typedef {import('type-fest').JsonValue} JsonValue
 */

/**
 * @template T
 * @extends {ESNode<T>}
 */
class ESNewNode extends ESNode {
	toJSON() {
		return /** @type {JsonValue} */(this[NODE_VALUE]);
	}
}

describe('isESNodeType', () => {
	it('returns true for exact ESNode classes', () => {
		const test = new ESNewNode('5');
		expect(isESNodeType(test, ESNewNode)).toBe(true);

		const test2 = new ESNumber('5');
		expect(isESNodeType(test2, ESNumber)).toBe(true);
	});

	it('returns false for inherited ESNode classes', () => {
		const test = new ESNewNode('5');
		expect(isESNodeType(test, ESNumber)).toBe(false);

		const test2 = new ESNumber('5');
		expect(isESNodeType(test2, ESNode)).toBe(false);
	});
});

describe('isESNode', () => {
	it('returns true for ESNodes', () => {
		expect(isESNode(new ESNewNode('5'))).toBe(true);
		expect(isESNode(new ESNumber('5'))).toBe(true);
	});
});
