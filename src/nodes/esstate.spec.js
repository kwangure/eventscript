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

	describe('transitions', () => {
		/** @type {ESState} */
		let machine;
		/** @type {string[]} */
		let transitions;
		beforeEach(() => {
			transitions = [];
			machine = new ESState('machine');
			machine.configure({
				actions: {
					always1() {
						transitions.push({
							...JSON.parse(JSON.stringify(this.transition)),
							action: 'always1',
						});
					},
					entry1() {
						transitions.push({
							...JSON.parse(JSON.stringify(this.transition)),
							action: 'entry1',
						});
					},
					exit1() {
						transitions.push({
							...JSON.parse(JSON.stringify(this.transition)),
							action: 'exit1',
						});
					},
					transition1() {
						transitions.push({
							...JSON.parse(JSON.stringify(this.transition)),
							action: 'transition1',
						});
					},
					always2() {
						transitions.push({
							...JSON.parse(JSON.stringify(this.transition)),
							action: 'always2',
						});
					},
					entry2() {
						transitions.push({
							...JSON.parse(JSON.stringify(this.transition)),
							action: 'entry2',
						});
					},
					exit2() {
						transitions.push({
							...JSON.parse(JSON.stringify(this.transition)),
							action: 'exit2',
						});
					},
					transition2() {
						transitions.push({
							...JSON.parse(JSON.stringify(this.transition)),
							action: 'transition2',
						});
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
			expect(transitions).toEqual([
				{
					action: 'entry1',
					active: true,
					from: null,
					to: {
						name: 'first',
						states: {},
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'always1',
					active: true,
					from: null,
					to: {
						name: 'first',
						states: {},
						transition: {
							active: false,
						},
					},
				},
			]);
			expect(machine.toJSON().transition).toEqual({
				active: false,
				from: undefined,
				to: {
					name: 'first',
					states: {},
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
			});
		});

		it('runs exit, transition, entry then transient actions', () => {
			expect(machine.toJSON().transition).toEqual({
				active: false,
				from: undefined,
				to: {
					name: 'first',
					states: {},
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
			});

			transitions = [];
			machine.dispatch('event');
			expect(transitions).toEqual([
				{
					action: 'exit1',
					active: true,
					from: {
						name: 'first',
						states: {},
						transition: {
							active: false,
						},
					},
					to: {
						name: 'second',
						states: {},
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'transition1',
					active: true,
					from: {
						name: 'first',
						states: {},
						transition: {
							active: false,
						},
					},
					to: {
						name: 'second',
						states: {},
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'entry2',
					active: true,
					from: {
						name: 'first',
						states: {},
						transition: {
							active: false,
						},
					},
					to: {
						name: 'second',
						states: {},
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'always2',
					active: true,
					from: {
						name: 'first',
						states: {},
						transition: {
							active: false,
						},
					},
					to: {
						name: 'second',
						states: {},
						transition: {
							active: false,
						},
					},
				},
			]);
			expect(machine.toJSON().transition).toEqual({
				active: false,
				from: {
					name: 'first',
					states: {},
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
				to: {
					name: 'second',
					states: {},
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
			});

			transitions = [];
			machine.dispatch('event');
			expect(transitions).toEqual([
				{
					action: 'exit2',
					active: true,
					from: {
						name: 'second',
						states: {},
						transition: {
							active: false,
						},
					},
					to: {
						name: 'first',
						states: {},
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'transition2',
					active: true,
					from: {
						name: 'second',
						states: {},
						transition: {
							active: false,
						},
					},
					to: {
						name: 'first',
						states: {},
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'entry1',
					active: true,
					from: {
						name: 'second',
						states: {},
						transition: {
							active: false,
						},
					},
					to: {
						name: 'first',
						states: {},
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'always1',
					active: true,
					from: {
						name: 'second',
						states: {},
						transition: {
							active: false,
						},
					},
					to: {
						name: 'first',
						states: {},
						transition: {
							active: false,
						},
					},
				},
			]);
			expect(machine.toJSON().transition).toEqual({
				active: false,
				from: {
					name: 'second',
					states: {},
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
				to: {
					name: 'first',
					states: {},
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
			});
		});
	});

	describe('conditions', () => {
		/** @type {ESState} */
		let machine;
		/** @type {string[]} */
		let actions;
		beforeEach(() => {
			actions = [];
			machine = new ESState('machine');
			machine.configure({
				actions: {
					ignore() {
						actions.push('ignore');
					},
					always() {
						actions.push('always');
					},
					entry() {
						actions.push('entry');
					},
					exit() {
						actions.push('exit');
					},
					transition() {
						actions.push('transition');
					},
				},
				conditions: {
					run() {
						return true;
					},
					ignore() {
						return false;
					},
				},
				states: {
					current: {
						always: [
							{
								actions: ['always'],
								condition: 'run',
							},
							{
								actions: ['always'],
							},
							{
								actions: ['ignore'],
								condition: 'ignore',
							},
						],
						entry: [
							{
								actions: ['entry'],
								condition: 'run',
							},
							{
								actions: ['entry'],
							},
							{
								actions: ['ignore'],
								condition: 'ignore',
							},
						],
						exit: [
							{
								actions: ['exit'],
								condition: 'run',
							},
							{
								actions: ['exit'],
							},
							{
								actions: ['ignore'],
								condition: 'ignore',
							},
						],
						on: {
							ignored: [
								{
									transitionTo: 'other',
									condition: 'ignore',
									actions: ['transition'],
								},
							],
							transition: [
								{
									transitionTo: 'other',
									actions: ['transition'],
								},
							],
						},
					},
					other: {},
				},
			});
		});

		it('ignores initial entry then transient actions', () => {
			expect(actions).toEqual(['entry', 'entry', 'always', 'always']);
		});

		it('ignores exit, transition, entry and transient actions', () => {
			actions = [];
			machine.dispatch('ignored');
			expect(machine.state?.name).toEqual('current');
			expect(actions).toEqual(['always', 'always']);

			actions = [];
			machine.dispatch('transition');
			expect(machine.state?.name).toEqual('other');
			expect(actions).toEqual(['exit', 'exit', 'transition']);
		});
	});
});
