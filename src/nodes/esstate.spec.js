import { beforeEach, describe, expect, it } from 'vitest';
import { ESState } from './esstate';

describe('machine', () => {
	describe('basics', () => {
		/** @type {ESState} */
		let machine;
		beforeEach(() => {
			machine = new ESState('machine');
			machine.configure({
				states: {
					state1: {
						on: {
							to2: [{
								transitionTo: 'state2',
							}],
						},
					},
					state2: {
						on: {
							to1: [{
								transitionTo: 'state1',
							}],
						},
					},
				},
			});
		});

		it('sets initial state', () => {
			expect(machine.state?.name).toBe('state1');
		});

		it('transitions on dispatch', () => {
			machine.dispatch('to2');
			expect(machine.state?.name).toBe('state2');
			machine.dispatch('to1');
			expect(machine.state?.name).toBe('state1');
			machine.dispatch('to2');
			expect(machine.state?.name).toBe('state2');
		});

		it('ignores invalid events', () => {
			machine.dispatch('random');
			expect(machine.state?.name).toBe('state1');
		});
	});

	describe('missing actions', () => {
		/** @type {ESState} */
		let machine;
		beforeEach(() => {
			machine = new ESState('machine');
		});
		it('throws on missing entry actions', () => {
			expect(() => machine.configure({
				states: {
					first: {
						entry: [{
							actions: ['missing'],
						}],
					},
				},
			})).toThrow('\'missing\'');
		});

		it('throws on missing exit actions', () => {
			expect(() => machine.configure({
				states: {
					first: {
						exit: [{
							actions: ['missing'],
						}],
					},
				},
			})).toThrow('\'missing\'');
		});

		it('throws on missing transient actions', () => {
			expect(() => machine.configure({
				states: {
					first: {
						always: [{
							actions: ['missing'],
						}],
					},
				},
			})).toThrow('\'missing\'');
		});
	});

	it('runs initial entry and transient actions', () => {
		const machine = new ESState('machine');

		/** @type {string[]} */
		const actions = [];
		machine.configure({
			actions: {
				always() {
					actions.push('always');
				},
				entry() {
					actions.push('entry');
				},
			},
			states: {
				first: {
					always: [{
						actions: ['always'],
					}],
					entry: [{
						actions: ['entry'],
					}],
				},
			},
		});

		expect(actions).toEqual(['entry', 'always']);
	});

	describe('actions', () => {
		/** @type {ESState} */
		let machine;
		/** @type {string[]} */
		let actions;
		beforeEach(() => {
			actions = [];
			machine = new ESState('machine');
			machine.configure({
				actions: {
					always1() {
						actions.push('always1');
					},
					entry1() {
						actions.push('entry1');
					},
					exit1() {
						actions.push('exit1');
					},
					transition1() {
						actions.push('transition1');
					},
					always2() {
						actions.push('always2');
					},
					entry2() {
						actions.push('entry2');
					},
					exit2() {
						actions.push('exit2');
					},
					transition2() {
						actions.push('transition2');
					},
				},
				states: {
					first: {
						always: [{
							actions: ['always1'],
						}],
						entry: [{
							actions: ['entry1'],
						}],
						exit: [{
							actions: ['exit1'],
						}],
						on: {
							event: [{
								transitionTo: 'second',
								actions: ['transition1'],
							}],
						},
					},
					second: {
						always: [{
							actions: ['always2'],
						}],
						entry: [{
							actions: ['entry2'],
						}],
						exit: [{
							actions: ['exit2'],
						}],
						on: {
							event: [{
								transitionTo: 'first',
								actions: ['transition2'],
							}],
						},
					},
				},
			});
		});

		it('runs initial entry then transient actions', () => {
			expect(actions).toEqual(['entry1', 'always1']);
		});

		it('runs exit, transition, entry then transient actions', () => {
			actions = [];
			machine.dispatch('event');
			expect(actions).toEqual(['exit1', 'transition1', 'entry2', 'always2']);

			actions = [];
			machine.dispatch('event');
			expect(actions).toEqual(['exit2', 'transition2', 'entry1', 'always1']);
		});
	});
});
