import { describe, expect, it } from 'vitest';
import { ESNode } from './esnode';

/**
 * @typedef {import('type-fest').JsonValue} JsonValue
 */

/**
 * @template T
 * @extends {ESNode<T>}
 */
class ESNewNode extends ESNode {
	toJSON() {
		return /** @type {JsonValue} */(super.get());
	}
}

describe('ESNode', () => {
	it('returns untransformed values', () => {
		const node = new ESNewNode('3');
		expect(node.get()).toBe('3');

		const node2 = new ESNewNode(3);
		expect(node2.get()).toBe(3);
	});

	it('set number using dispatch', () => {
		const node = new ESNewNode('3');
		expect(node.get()).toBe('3');

		node.dispatchEvent('set', '4');
		expect(node.get()).toBe('4');
	});

	it('ignores aliases when dispatch is overwritten', () => {
		const node = new ESNewNode('3');
		expect(node.get()).toBe('3');

		node.set('4');
		expect(node.get()).toBe('4');

		/**
		 * @template T
		 * @extends {ESNode<T>}
		 */
		class ESNewNode2 extends ESNode {
			/**
			 * @param {string} event
			 * @param {T} value
			 */
			dispatchEvent(event, value) {
				if (event === 'set') {
					super.dispatchEvent(event, value);
				}
			}
			toJSON() {
				return /** @type {JsonValue} */(super.get())
			}
		}

		const node2 = new ESNewNode2('3');
		node2.set('4');
		expect(node2.get()).toBe('3');
	});

	it.todo('calls subsbribers', () => {

	});

	describe('handles child and parent nodes', () => {
		const child1 = new ESNewNode('1');
		const child2 = new ESNewNode('2');
		const child3 = new ESNewNode('3');
		const parentNode = new ESNewNode('4');

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
});
