import { describe, expect, it } from 'vitest';
import { ESArray, ESBoolean, ESMap, ESNumber, ESString } from './nodes';
import { es } from './index.js';

describe('index', () => {
	it('creates arrays', () => {
		const values = [
			es.number(1),
			es.string('2'),
			es.boolean('false'),
		];
		const value = es.array(values);
		expect(value instanceof ESArray).toBe(true);
		expect([...value]).toEqual(values);
	});
	it('creates booleans', () => {
		const value = es.boolean(123);
		expect(value instanceof ESBoolean).toBe(true);
		expect(value[Symbol.toPrimitive]()).toBe(true);
	});
	it('creates maps', () => {
		/** @type {Record<string, ESNumber | ESString | ESBoolean>}*/
		const values = {
			one: es.number(1),
			two: es.string('2'),
			false: es.boolean('false'),
		};
		const value = es.map(values);
		expect(value instanceof ESMap).toBe(true);
		for (const [key, item] of value) {
			expect(values[key]).toBe(item);
		}
	});
	it('creates numbers', () => {
		const value = es.number('123');
		expect(value instanceof ESNumber).toBe(true);
		expect(value[Symbol.toPrimitive]()).toBe(123);
	});
	it('creates strings', () => {
		const value = es.string(123);
		expect(value instanceof ESString).toBe(true);
		expect(value.valueOf()).toBe('123');
	});
});
