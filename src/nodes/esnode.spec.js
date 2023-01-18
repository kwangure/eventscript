import { describe, expect, it } from 'vitest';
import { ESNode } from './esnode';

describe('ESNode', () => {
	it('returns untransformed values', () => {
		const node = new ESNode('3');
		expect(node.valueOf()).toBe('3');

		const node2 = new ESNode(3);
		expect(node2.valueOf()).toBe(3);
	});

	it('set number using dispatch', () => {
		const node = new ESNode('3');
		expect(node.valueOf()).toBe('3');

		node.dispatchEvent('set', '4');
		expect(node.valueOf()).toBe('4');
	});

	it('set number using alias', () => {
		const node = new ESNode('3');
		expect(node.valueOf()).toBe('3');

		node.set('4');
		expect(node.valueOf()).toBe('4');
	});

	it('ignores aliases when dispatch is overwritten', () => {
		/**
		 * @template T
		 * @extends {ESNode<T>}
		 */
		class ESNewNode extends ESNode {
			/**
			 * @param {string} event
			 * @param {T} value
			 */
			dispatchEvent(event, value) {
				if (event === 'set') {
					super.dispatchEvent(event, value);
				}
			}
		}

		const node = new ESNewNode('3');
		node.set('4');
		expect(node.valueOf()).toBe('3');
	});

	it.todo('calls subsbribers', () => {

	});
});
