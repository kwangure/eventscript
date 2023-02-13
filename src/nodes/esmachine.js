/**
 * @typedef {import('./esstate.js').ESState} ESState
 *
 * @typedef {{
 *     actions?: {
 *         [x: string]: (...args: any[]) => any,
 * 	   }
 *     initial: ESState
 * }} Config
 *
 * @typedef {{
 *     actions: Map<string, (...args: any) => any>
 *     initial: ESState
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
 *     actions: (string)[];
*     condition: string;
*     transitionTo: string;
* }} ValidatedHandler
 *
 */

import { NODE_CHILDREN, NODE_PARENT, NODE_SUBSCRIBERS, NODE_VALUE, STATE_TRANSITION } from './esnode_constants.js';

/**
 * @typedef {import('./esnode').ESNode} ESNode
 */

/**
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

	/** @type {ESState | null} */
	#state = null;
	/**
	 * @param {Config} config
	 */
	constructor(config) {
		this[NODE_VALUE] = this;
		this.#config = validateConfig(config);
		this.#state = this.#config.initial;
		/**
		 * @type {(() => void)}
		 */
		let unsubscribe;
		const self = this;
		/**
		 * @param {ESState} state
		 */
		function subscribe(state) {
			// eslint-disable-next-line no-extra-boolean-cast
			if (Boolean(state.isActive)) return;
			unsubscribe();

			const nextState = state[STATE_TRANSITION].to;
			// This should never happen but typescript doesn't know that
			if (!nextState) return;

			self.#state = nextState;

			unsubscribe = nextState.subscribe(subscribe);
		}
		unsubscribe = this.#state.subscribe(subscribe);
	}
	/**
	 * @param {string} event
	 * @param {...any} value
	 */
	dispatch(event, ...value) {
		this.#state?.dispatch(event, ...value);
	}
	get state() {
		return this.#state;
	}
	toJSON() {
		return '';
	}
	get transition() {
		return this.#state?.transition;
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
 * @param {Config} config
 */
export function create(config) {
	return new ESMachine(config);
}

/**
 * @param {Config} config
 * @returns {ValidatedConfig}
 */
function validateConfig(config) {
	const actions = config.actions
		? new Map(Object.entries(config.actions))
		: new Map();

	return {
		actions,
		initial: config.initial,
	};
}

