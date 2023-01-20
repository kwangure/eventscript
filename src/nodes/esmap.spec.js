import { beforeEach, describe, expect, it, test } from 'vitest';
import { ESMap } from './esmap.js';
import { NODE_VALUE } from './esnode_constants.js';
import { ESNumber } from './esnumber.js';

describe('ESMap', () => {
	/** @type {[string | number, ESNumber][]} */
	let values;
	/**
	 * @type {ESMap<string | number, ESNumber>}
	 */
	let map;

	beforeEach(() => {
		values = [1, 2, 3].map((n) => [n, new ESNumber(n)]);
		map = new ESMap(values);
	});

	test('get', () => {
		expect(map.get(1)).toBe(values[0][1]);
		expect(map.get(2)).toBe(values[1][1]);
		expect(map.get(3)).toBe(values[2][1]);
	});

	test('set', () => {
		expect(map[NODE_VALUE].size).toBe(3);

		const value = new ESNumber(4);
		map.set(4, value);
		expect(map[NODE_VALUE].size).toBe(4);
		expect(map.get(4)).toBe(value);
	});

	test('delete', () => {
		expect(map[NODE_VALUE].size).toBe(3);

		const value = /** @type {ESNumber} */(map.get(1));
		expect(value.parentNode).toBe(map);
		const isDeleted = map.delete(1);
		expect(isDeleted).toBe(true);
		expect(value.parentNode).toBe(null);
	});

	test('toJson', () => {
		map.set('four-hundred', new ESNumber(400));
		expect(map.toJSON()).toEqual({
			1: 1,
			2: 2,
			3: 3,
			'four-hundred': 400,
		});
	})

	describe('size', () => {
		it('has map as parentNode', () => {
			expect(map.size.parentNode).toBe(map);
		});

		it('increments on set', () => {
			expect(map.size[NODE_VALUE]).toBe(3);

			map.set(4, new ESNumber(4));
			expect(map.size[NODE_VALUE]).toBe(4);
			map.set(5, new ESNumber(5));
			expect(map.size[NODE_VALUE]).toBe(5);
		});

		it('decrements on delete', () => {
			expect(map.size[NODE_VALUE]).toBe(3);

			map.delete(2);
			expect(map.size[NODE_VALUE]).toBe(2);
			map.delete(1);
			expect(map.size[NODE_VALUE]).toBe(1);
		});

		it('is not called when elements changed, but size did not', () => {
			const first = /** @type {ESNumber} */(map.get(1));

			let mapCallCount = 0;
			map.subscribe(() => mapCallCount++);
			let lengthCallCount = 0;
			map.size.subscribe(() => lengthCallCount++);


			first.set(12);
			first.set(13);
			first.set(14);

			expect(mapCallCount).toBe(4);
			expect(lengthCallCount).toBe(1);
		});
	});
});
