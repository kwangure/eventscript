import { beforeEach, describe, expect, it, test } from 'vitest';
import { ESArray } from './esarray.js';
import { ESNumber } from './esnumber.js';

describe('ESArray', () => {
	/**
	 * @type {ESNumber[]}
	 */
	let values;
	/**
	 * @type {ESArray<number>}
	 */
	let array;

	beforeEach(() => {
		values = [1, 2, 3].map((n) => new ESNumber(n));
		array = new ESArray(values);
	});

	it('accepts values', () => {
		const got = array.get();
		for (let i = 0; i < got.length; i++) {
			const child = got[i];
			expect(child.parentNode).toBe(array);
			expect(child).toBe(values[i]);
		}
	});

	test('at', () => {
		expect(array.at(0)).toBe(values[0]);
		expect(array.at(1)).toBe(values[1]);
		expect(array.at(2)).toBe(values[2]);
		expect(array.at(-1)).toBe(values[2]);
	});

	test('get', () => {
		const got1 = array.get();
		const got2 = array.get();

		expect(got1).not.toBe(got2);
		expect(got1).toEqual(got2);
	});

	test('push', () => {
		const length1 = array.get().length;
		expect(length1).toBe(3);

		const value = new ESNumber(42);
		array.push(value);
		const length2 = array.get().length;
		expect(length2).toBe(4);
		expect(array.at(3)).toBe(value);
	});

	test('pop', () => {
		const length1 = array.get().length;
		expect(length1).toBe(3);

		const last = array.at(-1);
		const popped = array.pop();
		expect(popped).toBe(last);

		const length2 = array.get().length;
		expect(length2).toBe(2);
	});

	describe('length', () => {
		it('has array as parentNode', () => {
			expect(array.length.parentNode).toBe(array);
		});

		it('increments on push', () => {
			expect(array.length.get()).toBe(3);

			array.push(new ESNumber(42));
			expect(array.length.get()).toBe(4);
			array.push(new ESNumber(69));
			expect(array.length.get()).toBe(5);
		});

		it('decrements on pop', () => {
			expect(array.length.get()).toBe(3);

			array.pop();
			expect(array.length.get()).toBe(2);
			array.pop();
			expect(array.length.get()).toBe(1);
		});

		it('grows array when set', () => {
			array.length.set(10);
			expect(array.get().length).toBe(10);

			array.pop();
			expect(array.get().length).toBe(9);
			array.push(new ESNumber(42));
			expect(array.get().length).toBe(10);
		});

		it('calls array subscribers when set', () => {
			let arrayLength = -1;
			array.subscribe((n) => arrayLength = n.length);
			array.length.set(10);

			expect(arrayLength).toBe(10);
			array.pop();
			expect(arrayLength).toBe(9);
			array.push(new ESNumber(42));
			expect(arrayLength).toBe(10);
		});

		it('is not called when elements changed');
	});
});
