/**
 * @typedef {import('./types').StateConfig} StateConfig
 * @typedef {import('./types').ResolvedStateConfig} ResolvedStateConfig
 *
 * @typedef {import('./types').AlwaysHandlerConfig} AlwaysHandlerConfig
 * @typedef {import('./types').DispatchHandlerConfig} DispatchHandlerConfig
 * @typedef {import('./types').EntryHandlerConfig} EntryHandlerConfig
 * @typedef {import('./types').ExitHandlerConfig} ExitHandlerConfig
 */

import { STATE_SIBLINGS } from './esnode_constants.js';

/**
 * @typedef {AlwaysHandlerConfig | DispatchHandlerConfig | EntryHandlerConfig | ExitHandlerConfig} HandlerConfig
 *
 * @typedef {{
 *     type: 'always';
 *     actions: ((...args: any[]) => any)[];
 *     condition: string;
 *     transitionTo: ESState | null;
 * }} AlwaysHandler
 *
 * @typedef {{
 *     type: 'dispatch';
 *     actions: ((...args: any[]) => any)[];
 *     condition: string;
 *     transitionTo: ESState | null;
 * }} DispatchHandler
 *
 * @typedef {{
 *     type: 'entry';
 *     actions: ((...args: any[]) => any)[];
 *     condition: string;
 *     transitionTo: null;
 * }} EntryHandler
 *
 * @typedef {{
 *     type: 'exit';
 *     actions: ((...args: any[]) => any)[];
 *     condition: string;
 *     transitionTo: null;
 * }} ExitHandler
 *
 * @typedef {AlwaysHandler | DispatchHandler | EntryHandler | ExitHandler} Handler
 */

export class ESState {
	/** @type {AlwaysHandler[]} */
	#always = [];
	/** @type {EntryHandler[]} */
	#entry = [];
	/** @type {ExitHandler[]} */
	#exit = [];
	#transitionActive = false;
	/** @type {ESState | null} */
	#transitionFrom = null;
	/** @type {ESState | null} */
	#transitionTo = null;
	#configured = false;
	/** @type {Record<string, DispatchHandler[]>} */
	#on = {};
	/** @type {ESState | null} */
	#state = null;
	/** @type {Map<string, ESState>} */
	#states = new Map();
	/** @type {Set<(arg: this) => any>} */
	#subscribers = new Set();

	/** @param {string} name */
	constructor(name) {
		this.name = name;
	}

	#callSubscribers() {
		for (const subscriber of this.#subscribers) {
			subscriber(this);
		}
	}
	/**
	 * @param {Handler[]} handlers
	 * @param {...any} args
	 */
	#executeHandlers(handlers, ...args) {
		while (handlers.length) {
			const handler = handlers.shift();
			// This is not possible but TypeScript doesn't know that.
			if (!handler) break;
			const { actions, transitionTo } = handler;
			if (transitionTo) {
				handlers = [];

				this.#transitionFrom = this.#state;
				this.#transitionTo = transitionTo;
				this.#transitionActive = true;

				// exit actions for the current state
				if (this.#state?.exit) {
					this.#executeHandlers(this.#state.exit, ...args);
				}
				// transition actions for the current handler
				this.#runActions(actions, args);
				// change the active nested state for this state
				this.#state = transitionTo;
				// entry actions for the next state
				if (transitionTo.entry) {
					this.#executeHandlers(transitionTo.entry, ...args);
				}
				// transient actions for the next state
				if (transitionTo.always) {
					this.#executeHandlers(transitionTo.always, ...args);
				}
				// mark transition as completed
				this.#transitionActive = false;
			} else if (actions) {
				this.#runActions(actions, args);
			}
		}
	}
	/** @param {ESState} initialState*/
	#initialize(initialState) {
		this.#transitionTo = initialState;
		this.#transitionActive = true;
		this.#state = initialState;

		const handlers = [
			...initialState.entry,
			...initialState.always,
		];

		for (const { actions } of handlers) {
			for (const action of actions) {
				action.call(this);
			}
		}

		this.#transitionActive = false;
	}
	/**
	 * @param {((...args: any) => any)[]} actions
	 * @param {any[]} args
	 */
	#runActions(actions, args) {
		for (const action of actions) {
			action.call(this, ...args);
		}
	}

	/** @param {StateConfig} stateConfig */
	configure(stateConfig) {
		if (this.#configured) throw Error('State already configured');
		this.#configured = true;

		const actions = stateConfig.actions || {};
		if (stateConfig.states) {
			for (const name in stateConfig.states) {
				if (Object.hasOwn(stateConfig.states, name)) {
					const state = new ESState(name);
					this.#states.set(name, state);
				}
			}
			for (const [name, state] of this.#states) {
				const config = stateConfig.states[name];
				state.configure({
					...config,
					actions: {
						...actions,
						...config.actions,
					},
					[STATE_SIBLINGS]: this.#states,
				});
			}
		}

		const states = stateConfig[STATE_SIBLINGS] || new Map();
		const always = stateConfig.always || [];
		for (const handler of always) {
			this.#always.push({
				actions: resolveActions(actions, handler),
				condition: '',
				transitionTo: resolveTransition(states, handler),
				type: 'always',
			});
		}

		const entry = stateConfig.entry || [];
		for (const handler of entry) {
			this.#entry.push({
				actions: resolveActions(actions, handler),
				condition: '',
				transitionTo: null,
				type: 'entry',
			});
		}

		const exit = stateConfig.exit || [];
		for (const handler of exit) {
			this.#exit.push({
				actions: resolveActions(actions, handler),
				condition: '',
				transitionTo: null,
				type: 'exit',
			});
		}

		const eventHandlers = Object.entries(stateConfig.on || {});
		for (const [event, handlers] of eventHandlers) {
			this.#on[event] = handlers.map((handler) => ({
				actions: resolveActions(actions, handler),
				condition: '',
				transitionTo: resolveTransition(states, handler),
				type: 'dispatch',
			}));
		}

		const iteratorResult = this.#states.values().next();
		// Has at least one nested state
		if (!iteratorResult.done) {
			this.#initialize(iteratorResult.value);
		}
	}
	/**
	 * @param {string} event
	 * @param {...any} value
	 */
	dispatch(event, ...value) {
		if (!this.#state || !Object.hasOwn(this.#state.on, event)) return;
		this.#executeHandlers([
			...this.#state.on[event],
			...this.#state.always,
		], ...value);
		this.#callSubscribers();
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		fn(this);
		this.#subscribers.add(fn);
		return () => {
			this.#subscribers.delete(fn);
		};
	}
	/** @returns {import('./types').ESStateJson} */
	toJSON() {
		/** @type {import('./types').ESStateJson['states']} */
		const states = {};

		for (const [name, state] of this.#states) {
			states[name] = state.toJSON();
		}

		return {
			name: this.name,
			states,
			transition: {
				active: this.#transitionActive,
				from: this.#transitionFrom?.toJSON(),
				to: this.#transitionTo?.toJSON(),
			},
		};
	}

	get always() {
		return this.#always;
	}
	get entry() {
		return this.#entry;
	}
	get exit() {
		return this.#exit;
	}
	get on() {
		return this.#on;
	}
	get state() {
		return this.#state;
	}
	get transition() {
		return {
			active: this.#transitionActive,
			from: this.#transitionFrom,
			to: this.#transitionTo,
		};
	}
}

/**
 * @param {string} name
 */
export function create(name) {
	return new ESState(name);
}

/**
 * @param {NonNullable<StateConfig['actions']>} config
 * @param {Partial<HandlerConfig>} handler
 */
function resolveActions(config, handler) {
	const actions = [];
	for (const name of handler.actions || []) {
		const action = config[name];
		if (!action) {
			throw Error(`State references unknown action '${name}'.`);
		}
		actions.push(action);
	}
	return actions;
}

/**
 * @param {Map<string, ESState>} config
 * @param {Partial<AlwaysHandlerConfig | DispatchHandlerConfig>} handler
 */
function resolveTransition(config, handler) {
	const { transitionTo } = handler;
	if (transitionTo) {
		const state = config.get(transitionTo);
		if (!state) {
			throw Error(`Unknown sibling state '${handler.transitionTo}'.`);
		}
		return state;
	}
	return null;
}

