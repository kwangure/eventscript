import { describe, expect, it } from 'vitest';
import { ESNumber } from 'src/nodes/esnumber.js';

describe('ESNumber', () => {
	it('coerces non-numbers to numbers', () => {
		const number = new ESNumber('3');
		expect(number.get()).toBe(3);

		// @ts-expect-error
		// `&` does type coercion
		expect(number & 1).toBe(1);
	});

	it('is coercable to string', () => {
		const number = new ESNumber('3');
		expect(number.get() + 'abc').toBe('3abc');
	});

	it('is serializable to number', () => {
		const number = new ESNumber('5');
		expect(JSON.stringify(number)).toEqual('5');
	});

	it.todo('ignores aliases when dispatch is overwritten', () => {

	});
});
