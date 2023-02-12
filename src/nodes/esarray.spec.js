import { beforeEach, describe, expect, it, test } from 'vitest';
import { ESArray } from './esarray.js';
import { ESNumber } from './esnumber.js';
import { NODE_VALUE } from './esnode_constants.js';

describe('ESArray', () => {
	/**
	 * @type {ESNumber[]}
	 */
	let values;
	/**
	 * @type {ESArray<ESNumber>}
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
			array.subscribe((n) => arrayLength = Number(n.length));
			array.length.set(10);

			expect(arrayLength).toBe(10);
			array.pop();
			expect(arrayLength).toBe(9);
			array.push(new ESNumber(42));
			expect(arrayLength).toBe(10);
		});

		it('is not called when elements changed, but length did not', () => {
			const first = /** @type {ESNumber} */(array.at(1));

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

	it('bubbles changes to parents', () => {
		const number = new ESNumber(1);
		const child = new ESArray([number]);
		const parent = new ESArray([child]);
		const grandparent = new ESArray([parent]);

		let grandparentCallCount = 0;
		let parentCallCount = 0;
		let childCallCount = 0;
		grandparent.subscribe(() => grandparentCallCount += 1);
		parent.subscribe(() => parentCallCount += 1);
		child.subscribe(() => childCallCount += 1);

		expect(grandparentCallCount).toBe(1);
		expect(parentCallCount).toBe(1);
		expect(childCallCount).toBe(1);

		number.set(3);
		expect(grandparentCallCount).toBe(2);
		expect(parentCallCount).toBe(2);
		expect(childCallCount).toBe(2);

		number.set(0);
		expect(grandparentCallCount).toBe(3);
		expect(parentCallCount).toBe(3);
		expect(childCallCount).toBe(3);
	});

	it('is iterable', () => {
		const set = new Set(array);
		expect(set.has(values[0])).toBe(true);
		expect(set.has(values[1])).toBe(true);
		expect(set.has(values[2])).toBe(true);

		let index = 0;
		for (const esnumber of array) {
			expect(values[index]).toBe(esnumber);
			index++;
		}
	});

	test('toJson', () => {
		expect(array.toJSON()).toEqual([1, 2, 3]);

		array.length.set(5);
		expect(array.toJSON()).toEqual([1, 2, 3, null, null]);
	});
});
