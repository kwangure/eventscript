import type { JsonValue } from 'type-fest';

export declare abstract class ESNode<T> {
	constructor(value: T);
	/**
	 * @param {string} event
	 * @param {T} value
	 */
	public dispatchEvent(event: string, value: T): void;
	public get(): T;
	public set(value: T): void;
	public abstract toJSON(): JsonValue;
}
