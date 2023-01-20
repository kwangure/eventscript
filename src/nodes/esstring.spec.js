import { beforeEach, describe, expect, it } from 'vitest';
import { ESString } from './esstring';
import { NODE_VALUE } from './esnode_constants';

describe('ESString', () => {
	/**
	 * @type {ESString}
	 */
	let string;

	beforeEach(() => {
		string = new ESString(3);
	})

	it('coerces non-strings to strings', () => {
		expect(string[NODE_VALUE]).toBe('3');

		// `&` does type coercion
		expect(/** @type {any} */(string) * 2).toBe(6);
	});

	it('is coercable to string', () => {
		expect(string[NODE_VALUE] + 'abc').toBe('3abc');
	});

	it('is serializable to string', () => {
		expect(JSON.stringify(string)).toEqual('"3"');
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
		expect(stringvalue).toBe('3');

		string.set(3);
		expect(stringvalue).toBe('3');
	});
});
