import { describe, expect, it } from 'vitest';
import { ESNumber } from 'src/nodes/esnumber.js';
import { NODE_VALUE } from './esnode_constants.js';

describe('ESNumber', () => {
	it('coerces non-numbers to numbers', () => {
		const number = new ESNumber('3');
		expect(number[NODE_VALUE]).toBe(3);

		// `&` does type coercion
		// eslint-disable-next-line no-bitwise
		expect(/** @type {any} */(number) & 1).toBe(1);
	});

	it('is coercable to string', () => {
		const number = new ESNumber('3');
		expect(`${number[NODE_VALUE]}abc`).toBe('3abc');
	});

	it('is serializable to number', () => {
		const number = new ESNumber('5');
		expect(JSON.stringify(number)).toEqual('5');
	});

	it('creates new ESNumber from exisiting ESNumbers', () => {
		const number1 = new ESNumber('1');
		const number1Also = new ESNumber(number1);
		expect(number1Also[NODE_VALUE]).toBe(1);
		expect(number1).toEqual(number1Also);
		expect(number1).not.toBe(number1Also);
	});

	it('does not call subscribers on dispatchEvent unless value changed', () => {
		const number1 = new ESNumber('1');
		let number1value = 0;
		number1.subscribe((value) => number1value += value);
		expect(number1value).toBe(1);

		number1.set(1);
		expect(number1value).toBe(1);
	});
});
