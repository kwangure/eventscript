import { beforeEach, describe, expect, it } from 'vitest';
import { ESBoolean } from './esboolean.js';
import { NODE_VALUE } from './esnode_constants.js';

describe('ESBoolean', () => {
	/**
	 * @type {ESBoolean}
	 */
	let boolean;

	beforeEach(() => {
		boolean = new ESBoolean(3);
	});

	it('coerces non-booleans to booleabs', () => {
		expect(boolean[NODE_VALUE]).toBe(true);
	});

	it('is coercable to string', () => {
		expect(`${boolean[NODE_VALUE]}abc`).toBe('trueabc');
	});

	it('is serializable to string', () => {
		expect(JSON.stringify(boolean)).toEqual('true');
	});

	it('creates new ESBoolean from exisiting ESBooleans', () => {
		const booleanAlso = new ESBoolean(boolean);
		expect(booleanAlso[NODE_VALUE]).toBe(true);
		expect(boolean).toEqual(booleanAlso);
		expect(boolean).not.toBe(booleanAlso);
	});

	it('does not call subscribers on set unless value changed', () => {
		let booleanvalue = '';
		boolean.subscribe((value) => booleanvalue += value);
		expect(booleanvalue).toBe('true');

		boolean.set(true);
		expect(booleanvalue).toBe('true');
	});
});
