/**
 * @typedef {{
 *     actions?: {
 *         [x: string]: (...args: any[]) => any,
 * 	   }
 *     always?: Partial<Handler>[],
 *     entry?: Partial<Omit<Handler, 'transitionTo'>>[],
 *     exit?: Partial<Omit<Handler, 'transitionTo'>>[],
 *     on?: {
 *         [x: string]: Partial<Handler>[];
 *     };
 * }} StateConfig
 *
 * @typedef {{
 *     actions: Map<string | PrivateAction, (...args: any) => any>
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
 *     transitionTo: ESState;
 * }} Handler
 *
 * @typedef {{
 *     actions: (string | PrivateAction)[];
 *     condition: string;
 *     transitionTo: ESState | null;
 * }} ValidatedHandler
 *
 * @typedef {typeof SET_STATE
 *     | typeof SET_TRANSITION
 *     | typeof UNSET_TRANSITION
 * } PrivateAction
 */

import { NODE_CHILDREN, NODE_PARENT, NODE_SUBSCRIBERS, STATE_TRANSITION } from './esnode_constants.js';
import { bubbleChange } from './esnodeutils.js';
import { ESBoolean } from './esboolean.js';

const STATE_ACTIVE = Symbol('state-active');
const SET_STATE = Symbol('set-state');
const SET_TRANSITION = Symbol('set-transition');
const UNSET_TRANSITION = Symbol('unset-transition');

/**
 * @typedef {import('./esnode').ESNode} ESNode
 * @typedef {{
 * 		to: ESState | null,
 *  	from: ESState | null,
 *  	active: boolean,
 * }} Transition
 */

/**
 * @implements {ESNode}
 */
export class ESState {
	[NODE_CHILDREN] = new Set();

	/** @type {ESNode | null} */
	[NODE_PARENT] = null;

	/** @type {Set<(arg: this) => any>} */
	[NODE_SUBSCRIBERS] = new Set();

	[STATE_ACTIVE] = false;

	/** @type {Transition} */
	[STATE_TRANSITION] = { active: false, from: null, to: null };

	/** @type {ValidatedStateConfig} */
	#config;

	#isActive = new ESBoolean(false);

	/**
	 * @param {StateConfig} config
	 */
	constructor(config) {
		this.#config = validateConfig(config);
	}
	get config() {
		return this.#config;
	}
	/**
	 * @param {string} event
	 * @param {...any} value
	 */
	dispatch(event, ...value) {
		if (!Object.hasOwn(this.#config, event)) return;
		const handlers = [
			...(this.#config.on[event] ?? []),
			...this.#config.always,
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
			this.#config.actions.set(SET_STATE, () => {
				this.#isActive.true();
				if (this[STATE_TRANSITION].from) {
					this[STATE_TRANSITION].from.isActive.false();
				}
			});
			this.#config.actions.set(SET_TRANSITION, () => {
				transitionTo[STATE_TRANSITION].from = this;
				this[STATE_TRANSITION].to = transitionTo;
				this[STATE_TRANSITION].active = true;
			});
			this.#config.actions.set(UNSET_TRANSITION, () => {
				this[STATE_TRANSITION].active = false;
			});
			if (transitionTo) {
				handlers = [
					...this.#config.exit,
					toHandler({ actions }),
					toHandler({ actions: [SET_STATE]}),
					...transitionTo.config.entry,
					...transitionTo.config.always,
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
	get isActive() {
		return this.#isActive;
	}
	toJSON() {
		return {
			isActive: this.#isActive.toJSON(),
		};
	}
	get transition() {
		return this[STATE_TRANSITION];
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
 * @param {StateConfig} config
 */
export function create(config) {
	return new ESState(config);
}

/**
 * @param {StateConfig} stateConfig
 * @returns {ValidatedStateConfig}
 */
function validateConfig(stateConfig) {
	const always = (stateConfig.always || []).map(toHandler);
	const entry = (stateConfig.entry || []).map((handler) => toHandler({
		...handler,
		transitionTo: undefined,
	}));
	const exit = (stateConfig.exit || []).map((handler) => toHandler({
		...handler,
		transitionTo: undefined,
	}));
		/** @type {Record<string, ValidatedHandler[]>} */
	const on = {};
	const eventHandlers = Object.entries(stateConfig.on || {});
	for (const [event, handlers] of eventHandlers) {
		on[event] = handlers.map(toHandler);
	}
	const actions = stateConfig.actions
		? new Map(Object.entries(stateConfig.actions))
		: new Map();

	return { actions, always, entry, exit, on };
}

/**
 * @param {Partial<ValidatedHandler>} options
 * @returns {ValidatedHandler}
 */
function toHandler(options) {
	const { actions = [], condition = '', transitionTo = null } = options;
	return { actions, condition, transitionTo };
}
