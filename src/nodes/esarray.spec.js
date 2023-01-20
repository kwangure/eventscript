import { beforeEach, describe, expect, it, test } from 'vitest';
import { ESArray } from './esarray.js';
import { NODE_VALUE } from './esnode_constants.js';
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
		const got = array[NODE_VALUE];
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

	test('push', () => {
		const length1 = array[NODE_VALUE].length;
		expect(length1).toBe(3);

		const value = new ESNumber(42);
		array.push(value);
		const length2 = array[NODE_VALUE].length;
		expect(length2).toBe(4);
		expect(array.at(3)).toBe(value);
	});

	test('pop', () => {
		const length1 = array[NODE_VALUE].length;
		expect(length1).toBe(3);

		const last = array.at(-1);
		const popped = array.pop();
		expect(popped).toBe(last);

		const length2 = array[NODE_VALUE].length;
		expect(length2).toBe(2);
	});

	describe('length', () => {
		it('has array as parentNode', () => {
			expect(array.length.parentNode).toBe(array);
		});

		it('increments on push', () => {
			expect(array.length[NODE_VALUE]).toBe(3);

			array.push(new ESNumber(42));
			expect(array.length[NODE_VALUE]).toBe(4);
			array.push(new ESNumber(69));
			expect(array.length[NODE_VALUE]).toBe(5);
		});

		it('decrements on pop', () => {
			expect(array.length[NODE_VALUE]).toBe(3);

			array.pop();
			expect(array.length[NODE_VALUE]).toBe(2);
			array.pop();
			expect(array.length[NODE_VALUE]).toBe(1);
		});

		it('grows array when set', () => {
			array.length.set(10);
			expect(array[NODE_VALUE].length).toBe(10);

			array.pop();
			expect(array[NODE_VALUE].length).toBe(9);
			array.push(new ESNumber(42));
			expect(array[NODE_VALUE].length).toBe(10);
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

		it('is not called when elements changed, but length did not', () => {
			const first = /** @type {import('./esnode').ESNode<any>} */(array.at(1));

			let arrayCallCount = 0;
			array.subscribe(() => arrayCallCount++);
			let lengthCallCount = 0;
			array.length.subscribe(() => lengthCallCount++);

			first.set(12);
			first.set(13);
			first.set(14);

			expect(arrayCallCount).toBe(4);
			expect(lengthCallCount).toBe(1);
		});
	});
});
