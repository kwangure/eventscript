import { describe, expect, it } from 'vitest';
import { ESNode } from './esnode';
import { isESNode, isESNodeType } from './esnodeutils';
import { ESNumber } from './esnumber';

describe('isESNodeType', () => {
	it('returns true for exact ESNode classes', () => {
		// @ts-expect-error
		const test = new ESNode('5');
		expect(isESNodeType(test, ESNode)).toBe(true);

		const test2 = new ESNumber('5');
		expect(isESNodeType(test2, ESNumber)).toBe(true);
	});

	it('returns false for inherited ESNode classes', () => {
		// @ts-expect-error
		const test = new ESNode('5');
		expect(isESNodeType(test, ESNumber)).toBe(false);

		const test2 = new ESNumber('5');
		expect(isESNodeType(test2, ESNode)).toBe(false);
	});
});

describe('isESNode', () => {
	it('returns true for ESNodes', () => {
		// @ts-expect-error
		expect(isESNode(new ESNode('5'))).toBe(true);
		expect(isESNode(new ESNumber('5'))).toBe(true);
	});
});
