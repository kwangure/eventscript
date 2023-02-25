import type { STATE_PARENT, STATE_SIBLINGS } from "./esnode_constants";
import type { ESState } from "./esstate";

export type StateConfig = {
	actions?: {
		[x: string]: (...args: any[]) => any,
	}
	always?: Partial<StateHandler>[],
	entry?: Partial<Omit<StateHandler, 'transitionTo'>>[],
	exit?: Partial<Omit<StateHandler, 'transitionTo'>>[],
	on?: {
		[x: string]: Partial<StateHandler>[];
	};
	states?: {
		[x: string]: StateConfig;
	},
	[STATE_SIBLINGS]?: Map<string, ESState>
}

export type ResolvedStateConfig = {
	actions: Map<string, (...args: any) => any>
	always: ResolvedStateHandler[],
	entry: ResolvedStateHandler[],
	exit: ResolvedStateHandler[],
	on: {
		[x: string]: ResolvedStateHandler[];
	};
	states: Map<string, ESState>
}

export type StateHandler = {
	actions: string[];
	condition: string;
	transitionTo: string;
}

export type ResolvedStateHandler = {
	actions: ((...args: any[]) => any)[];
	condition?: string;
	transitionTo?: ESState;
}

export type StateTransition = {
	active: boolean;
	from: ESState | null;
	to: ESState | null;
}

