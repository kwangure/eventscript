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
 *     condition: (...args: any[]) => boolean;
 *     transitionTo: ESState | null;
 * }} AlwaysHandler
 *
 * @typedef {{
 *     type: 'dispatch';
 *     actions: ((...args: any[]) => any)[];
 *     condition: (...args: any[]) => boolean;
 *     transitionTo: ESState | null;
 * }} DispatchHandler
 *
 * @typedef {{
 *     type: 'entry';
 *     actions: ((...args: any[]) => any)[];
 *     condition: (...args: any[]) => boolean;
 *     transitionTo: null;
 * }} EntryHandler
 *
 * @typedef {{
 *     type: 'exit';
 *     actions: ((...args: any[]) => any)[];
 *     condition: (...args: any[]) => boolean;
 *     transitionTo: null;
 * }} ExitHandler
 *
 * @typedef {{
 *     type: 'init';
 *     actions: [];
 *     condition: (...args: any[]) => boolean;
 *     transitionTo: ESState;
 * }} InitHandler
 *
 * @typedef {AlwaysHandler | DispatchHandler | EntryHandler | ExitHandler | InitHandler} Handler
 */

export class ESState {
	/** @type {AlwaysHandler[]} */
	#always = [];
	#configured = false;
	/** @type {EntryHandler[]} */
	#entry = [];
	/** @type {ExitHandler[]} */
	#exit = [];
	/** @type {Record<string, DispatchHandler[]>} */
	#on = {};
	/** @type {ESState | null} */
	#state = null;
	/** @type {Map<string, ESState>} */
	#states = new Map();
	/** @type {Set<(arg: this) => any>} */
	#subscribers = new Set();
	#transitionActive = false;
	/** @type {ESState | null} */
	#transitionFrom = null;
	/** @type {ESState | null} */
	#transitionTo = null;

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
		for (const { actions, condition, transitionTo } of handlers) {
			if (!condition.call(this, ...args)) {
				continue;
			}
			if (transitionTo) {
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
				this.#executeHandlers(transitionTo.entry, ...args);
				// transient actions for the next state
				this.#executeHandlers(transitionTo.always, ...args);
				// mark transition as completed
				this.#transitionActive = false;
				break;
			}

			this.#runActions(actions, args);
		}
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
	get always() {
		return this.#always;
	}
	/** @param {StateConfig} stateConfig */
	configure(stateConfig) {
		if (this.#configured) throw Error('State already configured');
		this.#configured = true;

		const actions = stateConfig.actions || {};
		const conditions = stateConfig.conditions || {};
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
					conditions: {
						...conditions,
						...config.conditions,
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
				condition: resolveCondition(conditions, handler),
				transitionTo: resolveTransition(states, handler),
				type: 'always',
			});
		}

		const entry = stateConfig.entry || [];
		for (const handler of entry) {
			this.#entry.push({
				actions: resolveActions(actions, handler),
				condition: resolveCondition(conditions, handler),
				transitionTo: null,
				type: 'entry',
			});
		}

		const exit = stateConfig.exit || [];
		for (const handler of exit) {
			this.#exit.push({
				actions: resolveActions(actions, handler),
				condition: resolveCondition(conditions, handler),
				transitionTo: null,
				type: 'exit',
			});
		}

		const eventHandlers = Object.entries(stateConfig.on || {});
		for (const [event, handlers] of eventHandlers) {
			this.#on[event] = handlers.map((handler) => ({
				actions: resolveActions(actions, handler),
				condition: resolveCondition(conditions, handler),
				transitionTo: resolveTransition(states, handler),
				type: 'dispatch',
			}));
		}

		const iteratorResult = this.#states.values().next();
		// Has at least one nested state
		if (!iteratorResult.done) {
			this.#executeHandlers([{
				actions: [],
				condition: () => true,
				transitionTo: iteratorResult.value,
				type: 'init',
			}]);
		}
	}
	/**
	 * @param {string} event
	 * @param {...any} value
	 */
	dispatch(event, ...value) {
		if (!this.#state) return;
		const handlers = [];
		if (Object.hasOwn(this.#state.on, event)) {
			handlers.push(...this.#state.on[event]);
		}
		handlers.push(...this.#state.always);
		this.#executeHandlers(handlers, ...value);
		this.#callSubscribers();
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
 * @param {NonNullable<StateConfig['conditions']>} config
 * @param {Partial<HandlerConfig>} handler
 */
function resolveCondition(config, handler) {
	if (handler.condition === undefined) {
		return () => true;
	}
	const condition = config[handler.condition];
	if (!condition) {
		throw Error(`State references unknown condition '${handler.condition}'.`);
	}
	return condition;
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

