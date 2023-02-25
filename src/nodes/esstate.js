/**
 * @typedef {import('./types').StateConfig} StateConfig
 * @typedef {import('./types').ResolvedStateConfig} ResolvedStateConfig
 * @typedef {import('./types').StateHandler} Handler
 * @typedef {import('./types').ResolvedStateHandler} ResolvedStateHandler
 * @typedef {import('./types').StateTransition} StateTransition
 * @typedef {import('./esnode').ESNode} ESNode
 */

import { STATE_SIBLINGS, STATE_TRANSITION } from './esnode_constants.js';

export class ESState {
	/** @type {StateTransition} */
	[STATE_TRANSITION] = { active: false, from: null, to: null };
	/** @type {ResolvedStateConfig} */
	#config = {
		actions: new Map(),
		always: [],
		entry: [],
		exit: [],
		on: {},
		states: new Map(),
	};
	#configured = false;
	/** @type {ESState | null} */
	#state = null;
	/** @type {Set<(arg: this) => any>} */
	#subscribers = new Set();

	/** @param {string} name */
	constructor(name) {
		this.name = name;
	}
	get config() {
		return this.#config;
	}
	/**
	 * @param {string} event
	 * @param {...any} value
	 */
	dispatch(event, ...value) {
		if (
			!this.#state?.config
			|| !Object.hasOwn(this.#state.config.on, event)
		) return;
		const handlers = [
			...this.#state.config.on[event],
			...this.#state.config.always,
		];
		this.#executeHandlers(handlers, ...value);
	}
	/**
	 * @param {ResolvedStateHandler[]} handlers
	 * @param {...any} args
	 */
	#executeHandlers(handlers, ...args) {
		while (handlers.length) {
			const handler
				= /** @type {ResolvedStateHandler} */(handlers.shift());
			const { actions, transitionTo } = handler;
			if (transitionTo) {
				handlers = [];
				// mark transition as active
				handlers.push({
					actions: [() => {
						this[STATE_TRANSITION] = {
							from: this.#state,
							to: transitionTo,
							active: true,
						};
					}],
				});
				// exit actions for the current state
				if (this.#state?.config.exit) {
					handlers.push(...this.#state.config.exit);
				}
				// transition actions for the current state
				handlers.push({ actions: handler.actions });
				// change the active nested state for this state
				handlers.push({
					actions: [() => this.#state = transitionTo],
				});
				// entry actions for the next state
				if (transitionTo.config.entry) {
					handlers.push(...transitionTo.config.entry);
				}
				// transient actions for the next state
				if (transitionTo.config.always) {
					handlers.push(...transitionTo.config.always);
				}
				// mark transition as completed
				handlers.push({
					actions: [() => {
						this[STATE_TRANSITION].active = false;
					}],
				});

				continue;
			}
			this.#runActions(actions, args);
		}

		this.#callSubscribers();
	}
	#callSubscribers() {
		for (const subscriber of this.#subscribers) {
			subscriber(this);
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
	toJSON() {
		return {
			name: this.name,
		};
	}
	get transition() {
		return this[STATE_TRANSITION];
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		this.#subscribers.add(fn);
		fn(this);
		return () => {
			this.#subscribers.delete(fn);
		};
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
					this.#config.states.set(name, state);
				}
			}
			for (const [name, state] of this.#config.states) {
				const config = stateConfig.states[name];
				state.configure({
					...config,
					actions: {
						...actions,
						...config.actions,
					},
					[STATE_SIBLINGS]: this.#config.states,
				});
			}
		}

		/** @type {(handler: Partial<Handler>) => ResolvedStateHandler} */
		const validateHandler = (handler) => (
			resolveHandler({
				actions,
				states: stateConfig[STATE_SIBLINGS] || new Map(),
			}, handler)
		);
		const always = stateConfig.always || [];
		for (const handler of always) {
			const validatedStateHandler = validateHandler(handler);
			this.#config.always.push(validatedStateHandler);
		}

		const entry = stateConfig.entry || [];
		for (const handler of entry) {
			const validatedStateHandler = validateHandler({
				...handler,
				transitionTo: undefined,
			});
			this.#config.entry.push(validatedStateHandler);
		}

		const exit = stateConfig.exit || [];
		for (const handler of exit) {
			const validatedStateHandler = validateHandler({
				...handler,
				transitionTo: undefined,
			});
			this.#config.exit.push(validatedStateHandler);
		}

		const eventHandlers = Object.entries(stateConfig.on || {});
		for (const [event, handlers] of eventHandlers) {
			this.#config.on[event] = handlers.map(validateHandler);
		}

		const iteratorResult = this.#config.states.values().next();
		// Has at least one nested state
		if (!iteratorResult.done) {
			this.#initialize(iteratorResult.value);
		}
	}

	/** @param {ESState} initialState*/
	#initialize(initialState) {
		this[STATE_TRANSITION].to = initialState;
		this[STATE_TRANSITION].active = true;
		this.#state = initialState;

		const handlers = [
			...initialState.config.entry,
			...initialState.config.always,
		];

		for (const { actions } of handlers) {
			for (const action of actions) {
				action.call(this);
			}
		}

		this[STATE_TRANSITION].active = false;
	}
	get state() {
		return this.#state;
	}
}

/**
 * @param {string} name
 */
export function create(name) {
	return new ESState(name);
}

/**
 * @param {{
 *     actions: NonNullable<StateConfig['actions']>;
 *     states: Map<string, ESState>;
 * }} config
 * @param {Partial<Handler>} handler
 * @returns {ResolvedStateHandler}
 */
function resolveHandler(config, handler) {
	const { condition = '' } = handler;

	const actions = [];
	for (const name of handler.actions || []) {
		const action = config.actions[name];
		if (!action) {
			throw Error(`State references unknown action '${name}'.`);
		}
		actions.push(action);
	}

	let transitionTo;
	if (handler.transitionTo) {
		transitionTo = config.states.get(handler.transitionTo);
		if (!transitionTo) {
			throw Error(`Unknown sibling state '${handler.transitionTo}'.`);
		}
	}

	return { actions, condition, transitionTo };
}
