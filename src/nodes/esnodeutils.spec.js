import { describe, expect, it } from 'vitest';
import { ESNode } from './esnode';
import { isESNode, isESNodeType } from './esnodeutils';
import { ESNumber } from './esnumber';

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
