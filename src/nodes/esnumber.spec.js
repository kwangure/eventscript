import { describe, expect, it } from 'vitest';
import { ESNumber } from 'src/nodes/esnumber.js';
import { NODE_VALUE } from './esnode_constants';

describe('ESNumber', () => {
	it('coerces non-numbers to numbers', () => {
		const number = new ESNumber('3');
		expect(number[NODE_VALUE]).toBe(3);

		// `&` does type coercion
		expect(/** @type {any} */(number) & 1).toBe(1);
	});

	it('is coercable to string', () => {
		const number = new ESNumber('3');
		expect(number[NODE_VALUE] + 'abc').toBe('3abc');
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

	describe('handles child and parent nodes', () => {
		const child1 = new ESNumber('1');
		const child2 = new ESNumber('2');
		const child3 = new ESNumber('3');
		const parentNode = new ESNumber('4');

		let childValues = '';
		child1.subscribe((value) => childValues += value);
		child2.subscribe((value) => childValues += value);
		child3.subscribe((value) => childValues += value);

		let parentValues = '';
		parentNode.subscribe((value) => parentValues += value);

		it('sets parent & child nodes', () => {
			parentNode.append(child1, child2, child3);

			expect(child1.parentNode).toBe(parentNode);
			expect(child2.parentNode).toBe(parentNode);
			expect(child3.parentNode).toBe(parentNode);
			expect(childValues).toBe('123123');

			expect(parentNode.children.length).toBe(3);
			expect(parentNode.children.at(0)).toBe(child1);
			expect(parentNode.children.at(1)).toBe(child2);
			expect(parentNode.children.at(2)).toBe(child3);
			expect(parentValues).toBe('44');
		});

		it('removes parent & child nodes', () => {
			parentNode.remove(child1, child2, child3);
			expect(child1.parentNode).toBe(null);
			expect(child2.parentNode).toBe(null);
			expect(child3.parentNode).toBe(null);
			expect(childValues).toBe('123123123');

			expect(parentNode.children.length).toBe(0);
			expect(parentValues).toBe('444');
		});

		it('ignores bogus removes', () => {
			parentNode.remove(child1, child2, child3);
			expect(childValues).toBe('123123123');
			expect(parentValues).toBe('444');
		});
	});

	it('bubbles changes to parents', () => {
		const grandparent = new ESNumber('1');
		const parent = new ESNumber('2');
		const child = new ESNumber('3');

		let grandvalue = '';
		let parentvalue = '';
		let childvalue = '';
		grandparent.subscribe((value) => grandvalue += value)
		parent.subscribe((value) => parentvalue += value)
		child.subscribe((value) => childvalue += value)

		grandparent.append(parent);
		parent.append(child);

		expect(grandvalue).toBe('111');
		expect(parentvalue).toBe('222');
		expect(childvalue).toBe('33');
		child.set('4');
		expect(grandvalue).toBe('1111');
		expect(parentvalue).toBe('2222');
		expect(childvalue).toBe('334');
	});
});
