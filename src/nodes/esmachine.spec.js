import { beforeEach, describe, expect, it } from 'vitest';
import { ESMachine } from './esmachine.js';

describe('machine', () => {
	/**
	 * @type {import('./esmachine.js').Config}
	 */
	let config;
	beforeEach(() => {
		config = {
			states: {
				readable: {
					on: {
						EDIT: [{
							transitionTo: 'editable',
						}],
					},
				},
				editable: {
					on: {
						SAVE: [{
							transitionTo: 'readable',
						}],
					},
				},
			},
		};
	});

	it('requires states', () => {
		expect(() => new ESMachine({ states: {}})).toThrow('Include one or more states');
	});

	it('sets initial state', () => {
		expect(new ESMachine(config).state.valueOf()).toBe('readable');
	});

	it('executes initial state entry actions', () => {
		const message = 'Entry executed. ';
		config.states.readable.entry = [{
			actions: [
				'logExecuted',
				'logExecuted',
			],
		}];
		config.actions = {
			logExecuted() {
				entryExecuted += message;
			},
		};
		let entryExecuted = '';
		new ESMachine(config);
		expect(entryExecuted).toBe(message + message);
	});

	it('transitions on dispatch', () => {
		const machine = new ESMachine(config);
		machine.dispatch('EDIT');
		expect(machine.state.valueOf()).toBe('editable');
		machine.dispatch('SAVE');
		expect(machine.state.valueOf()).toBe('readable');
	});

	describe.todo('transitionTo', () => {

	});
});
