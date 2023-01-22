import { beforeEach, describe, expect, it } from 'vitest';
import { ESString } from './esstring.js';
import { NODE_VALUE } from './esnode_constants.js';

describe('ESString', () => {
	/**
	 * @type {ESString}
	 */
	let string;

	beforeEach(() => {
		string = new ESString(345);
	});

	it('coerces non-strings to strings', () => {
		expect(string[NODE_VALUE]).toBe('345');

		// `&` does type coercion
		expect(/** @type {any} */(string) * 2).toBe(690);
	});

	it('is coercable to string', () => {
		expect(`${string[NODE_VALUE]}abc`).toBe('345abc');
	});

	it('is serializable to string', () => {
		expect(JSON.stringify(string)).toEqual('"345"');
	});

	it('creates new ESString from exisiting ESStrings', () => {
		const string1 = new ESString('1');
		const string1Also = new ESString(string1);
		expect(string1Also[NODE_VALUE]).toBe('1');
		expect(string1).toEqual(string1Also);
		expect(string1).not.toBe(string1Also);
	});

	it('does not call subscribers on set unless value changed', () => {
		let stringvalue= '';
		string.subscribe((value) => stringvalue += value);
		expect(stringvalue).toBe('345');

		string.set(345);
		expect(stringvalue).toBe('345');
	});

	it('is iterable', () => {
		const set = new Set(string);
		expect(set.has('3')).toBe(true);
		expect(set.has('4')).toBe(true);
		expect(set.has('5')).toBe(true);

		const values = String(string);
		let index = 0;
		for (const character of string) {
			expect(character).toBe(values[index]);
			index++;
		}
	});
});
