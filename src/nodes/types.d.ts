import type { STATE_PARENT, STATE_SIBLINGS } from "./esnode_constants";
import type { ESState } from "./esstate";

export type StateConfig = {
	actions?: {
		[x: string]: (this: ESState, ...args: any[]) => any,
	}
	always?: AlwaysHandlerConfig[],
	entry?: EntryHandlerConfig[],
	exit?: ExitHandlerConfig[],
	on?: {
		[x: string]: DispatchHandlerConfig[];
	};
	states?: {
		[x: string]: StateConfig;
	},
	[STATE_SIBLINGS]?: Map<string, ESState>
}

export type ResolvedStateConfig = {
	states: Map<string, ESState>
}

export type AlwaysHandlerConfig = {
	actions?: string[];
	condition?: string;
	transitionTo?: string;
}

export type DispatchHandlerConfig = {
	actions?: string[];
	condition?: string;
	transitionTo?: string;
}

export type EntryHandlerConfig = {
	actions?: string[];
	condition?: string;
}

export type ExitHandlerConfig = {
	actions?: string[];
	condition?: string;
}

export type ESStateJson = {
	name: string,
	states: {
		[x: string]: ESStateJson,
	},
	transition: {
		active: boolean;
		from: ESStateJson | undefined,
		to: ESStateJson | undefined,
	}
};


