import { beforeEach, describe, expect, it } from 'vitest';
import { es } from '../index.js';
import { ESMachine } from './esmachine.js';

describe('machine', () => {
	/**
	 * @type {import('./esmachine.js').Config}
	 */
	let config;
	/**
	 * @type {import("./esmap.js").ESMap<string, import("./esstring.js").ESString | import("./esboolean.js").ESBoolean>}
	 */
	let value;
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
		value = es.map({
			string: es.string(''),
			value: es.boolean(false),
		});
	});

	it('requires states', () => {
		expect(() => new ESMachine(value, { states: {}})).toThrow('Include one or more states');
	});

	it('sets initial state', () => {
		expect(new ESMachine(value, config).state.valueOf()).toBe('readable');
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
		new ESMachine(value, config);
		expect(entryExecuted).toBe(message + message);
	});

	it('transitions on dispatch', () => {
		const machine = new ESMachine(value, config);
		machine.dispatch('EDIT');
		expect(machine.state.valueOf()).toBe('editable');
		machine.dispatch('SAVE');
		expect(machine.state.valueOf()).toBe('readable');
	});

	describe.todo('transitionTo', () => {

	});
});
