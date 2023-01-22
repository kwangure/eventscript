import { beforeEach, describe, expect, it, test } from 'vitest';
import { ESString } from './esstring.js';

describe('ESString', () => {
	/**
	 * @type {ESString}
	 */
	let string;

	beforeEach(() => {
		string = new ESString(345);
	});

	it('coerces non-strings to strings', () => {
		expect(string[Symbol.toPrimitive]()).toBe('345');

		// `&` does type coercion
		expect(/** @type {any} */(string) * 2).toBe(690);
	});

	it('is coercable to string', () => {
		expect(`${string}abc`).toBe('345abc');
	});

	it('is serializable to string', () => {
		expect(JSON.stringify(string)).toEqual('"345"');
	});

	it('creates new ESString from exisiting ESStrings', () => {
		const string1 = new ESString('1');
		const string1Also = new ESString(string1);
		expect(String(string1Also)).toBe('1');
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

	describe('ESString.prototype.', () => {
		test('at', () => {
			expect(string.at(0)).toBe('3');
			expect(string.at(-1)).toBe('5');
		});

		test('charAt', () => {
			expect(string.charAt(0)).toBe('3');
			expect(string.charAt(2)).toBe('5');
		});

		test('charCodeAt', () => {
			expect(string.at(0)).toBe('3');
			expect(string.at(2)).toBe('5');
		});

		test('codePointAt', () => {
			expect(string.at(0)).toBe('3');
			expect(string.at(2)).toBe('5');
		});

		test('endsWith', () => {
			expect(string.endsWith('5')).toBe(true);
			expect(string.endsWith('4')).toBe(false);
		});

		test('indexOf', () => {
			expect(string.indexOf('4')).toBe(1);
			expect(string.indexOf('6')).toBe(-1);
		});

		test('includes', () => {
			expect(string.includes('4')).toBe(true);
			expect(string.includes('6')).toBe(false);
		});

		test('lastIndexOf', () => {
			expect(string.lastIndexOf('4')).toBe(1);
			expect(string.lastIndexOf('6')).toBe(-1);
		});

		test('localeCompare', () => {
			expect(string.localeCompare('345')).toBe(0);
			expect(string.localeCompare('234')).toBe(1);
		});

		test('match', () => {
			expect(string.match(/4/)).toEqual('345'.match(/4/));
			expect(string.match(/6/)).toEqual(null);
		});

		test('matchAll', () => {
			expect(string.matchAll(/\d/g)).toEqual('345'.matchAll(/\d/g));
			expect(string.matchAll(/6/g)).toEqual('345'.matchAll(/6/g));
		});

		test('startsWith', () => {
			expect(string.startsWith('3')).toBe(true);
			expect(string.startsWith('4')).toBe(false);
		});

		test('valueOf', () => {
			expect(string.valueOf()).toBe('345');
		});
	});
});
