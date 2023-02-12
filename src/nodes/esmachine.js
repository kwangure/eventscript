/**
 * @typedef {{
 *     actions?: {
 *         [x: string]: (...args: any[]) => any,
 * 	   }
 *     states: {
 *         [x: string]: StateConfig,
 *     },
 * }} Config
 *
 * @typedef {{
 *     actions: Map<string | PrivateAction, (...args: any) => any>
 *     states: Map<string, ValidatedStateConfig>;
 * }} ValidatedConfig
 *
 * @typedef {{
 *     always?: Partial<Handler>[],
 *     entry?: Partial<Omit<Handler, 'transitionTo'>>[],
 *     exit?: Partial<Omit<Handler, 'transitionTo'>>[],
 *     on?: {
 *         [x: string]: Partial<Handler>[];
 *     };
 * }} StateConfig
 *
 * @typedef {{
 *     always: ValidatedHandler[],
 *     entry: ValidatedHandler[],
 *     exit: ValidatedHandler[],
 *     on: {
 *         [x: string]: ValidatedHandler[];
 *     };
 * }} ValidatedStateConfig
 *
 * @typedef {{
 *     actions: string[];
 *     condition: string;
 *     transitionTo: string;
 * }} Handler
 *
 * @typedef {{
 *     actions: (string | PrivateAction)[];
*     condition: string;
*     transitionTo: string;
* }} ValidatedHandler
 *
 * @typedef {typeof SET_STATE
 *     | typeof SET_TRANSITION
 *     | typeof UNSET_TRANSITION
 * } PrivateAction
 */

import { append, bubbleChange } from './esnodeutils.js';
import { NODE_CHILDREN, NODE_PARENT, NODE_SUBSCRIBERS, NODE_VALUE } from './esnode_constants.js';
import { ESString } from './esstring.js';

const SET_STATE = Symbol('set-state');
const SET_TRANSITION = Symbol('set-transition');
const UNSET_TRANSITION = Symbol('unset-transition');

/**
 * @typedef {import('./esnode').ESNode} ESNode
 */

/**
 * @template {ESNode} T
 * @implements {ESNode}
 */
export class ESMachine {
	[NODE_CHILDREN] = new Set();

	/** @type {ESNode | null} */
	[NODE_PARENT] = null;

	/** @type {Set<(arg: this) => any>} */
	[NODE_SUBSCRIBERS] = new Set();

	[NODE_VALUE] = '';
	/** @type {ValidatedConfig} */
	#config;
	#state = new ESString('');
	#stateValue = '';
	/** @type {T} */
	#value;
	/**
	 * @type {{
	 * 		to: string | null,
	 *  	from: string | null,
	 *  	active: boolean,
	 * }}
	 **/
	#transition = {
		to: null,
		from: null,
		active: false,
	};
	/**
	 * @param {T} node
	 * @param {Config} config
	 */
	constructor(node, config) {
		this.#value = node;
		this[NODE_VALUE] = this;
		this.#config = validateConfig(config);

		const firstState = this.#config.states.keys().next().value;
		if (!firstState) {
			throw Error('Include one or more states in the ESMachine config.');
		}

		this.#state.subscribe((value) => {
			if (this.#stateValue === String(value)) return;
			// TODO: Guard against changing state without calling subscribers
			this.#state.set(this.#stateValue);
		});
		this.#executeHandlers([
			toHandler({ transitionTo: firstState }),
		]);

		append(this, this.#state, node);
	}
	/**
	 * @param {string} event
	 * @param {...any} value
	 */
	dispatch(event, ...value) {
		const stateConfig = this.#stateConfig(this.#state.valueOf());
		if (!stateConfig) return;
		if (!Object.hasOwn(stateConfig.on, event)) return;
		const handlers = [
			...(stateConfig.on[event] ?? []),
			...stateConfig.always,
		];
		this.#executeHandlers(handlers, ...value);
	}
	/**
	 * @param {ValidatedHandler[]} handlers
	 * @param {...any} args
	 */
	#executeHandlers(handlers, ...args) {
		while (handlers.length) {
			const handler = /** @type {Handler} */(handlers.shift());
			const { actions, transitionTo } = handler;
			if (transitionTo) {
				this.#config.actions.set(SET_STATE, () => {
					this.#setState(transitionTo);
				});
				this.#config.actions.set(SET_TRANSITION, () => {
					this.#transition.to = transitionTo;
					this.#transition.from = this.#state.valueOf();
					this.#transition.active = true;
				});
				this.#config.actions.set(UNSET_TRANSITION, () => {
					this.#transition.active = false;
				});
				handlers = [
					...this.#getHandlers('exit', this.#state.valueOf()),
					toHandler({ actions }),
					toHandler({ actions: [SET_STATE]}),
					...this.#getHandlers('entry', transitionTo),
					...this.#getHandlers('always', transitionTo),
					toHandler({ actions: [UNSET_TRANSITION]}),
				];
				continue;
			}
			for (const actionName of actions) {
				const action = this.#config.actions.get(actionName);
				if (!action) {
					throw Error(`Attempted run to unknown action '${String(actionName)}'`);
				}
				action.call(this, ...args);
			}
		}
		bubbleChange(this);
	}
	/**
	 * @param {'always' | 'entry' | 'exit'} type
	 * @param {any} state
	 */
	#getHandlers(type, state) {
		const stateConfig = this.#stateConfig(state);
		if (!stateConfig) return [];
		return stateConfig[type];
	}
	/**
	 * @param {string} state
	 */
	#setState(state) {
		this.#stateValue = state;
		this.#state.set(state);
	}
	get state() {
		return this.#state;
	}
	/**
	 * @param {string} state
	 */
	#stateConfig(state) {
		return this.#config.states.get(state);
	}
	toJSON() {
		return structuredClone({
			state: this.#state.valueOf(),
			transition: this.#transition,
		});
	}
	get transition() {
		return structuredClone(this.#transition);
	}
	get parentNode() {
		return this[NODE_PARENT];
	}
	/** @param {(arg: this) => any} fn */
	subscribe(fn) {
		this[NODE_SUBSCRIBERS].add(fn);
		fn(this);
		return () => {
			this[NODE_SUBSCRIBERS].delete(fn);
		};
	}
}

/**
 * @template {ESNode} T
 * @param {T} node
 * @param {Config} config
 */
export function create(node, config) {
	return new ESMachine(node, config);
}

/**
 * @param {Config} config
 * @returns {ValidatedConfig}
 */
function validateConfig(config) {
	const states = config.states ? Object.entries(config.states) : [];
	/** @type {Map<string, ValidatedStateConfig>} */
	const validatedStateConfigs = new Map();
	for (const [stateName, stateConfig] of states) {
		const always = (stateConfig.always || []).map(toHandler);
		const entry = (stateConfig.entry || []).map((handler) => toHandler({
			...handler,
			transitionTo: '',
		}));
		const exit = (stateConfig.exit || []).map((handler) => toHandler({
			...handler,
			transitionTo: '',
		}));
		/** @type {Record<string, ValidatedHandler[]>} */
		const on = {};
		const eventHandlers = Object.entries(stateConfig.on || {});
		for (const [event, handlers] of eventHandlers) {
			on[event] = handlers.map(toHandler);
		}
		validatedStateConfigs.set(stateName, { always, entry, exit, on });
	}

	const actions = config.actions
		? new Map(Object.entries(config.actions))
		: new Map();

	return {
		actions,
		states: validatedStateConfigs,
	};
}

/**
 * @param {Partial<ValidatedHandler>} options
 * @returns {ValidatedHandler}
 */
function toHandler(options) {
	const { actions = [], condition = '', transitionTo = '' } = options;
	return { actions, condition, transitionTo };
}
