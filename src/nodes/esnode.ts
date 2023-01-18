import type { JsonValue } from "type-fest";
import { isESNodeType } from "./esnodeutils";

export abstract class ESNode<T> {
	#subscribers: Set<(arg: T) => any> = new Set();
	#value;
	constructor(value: T) {
		this.#value = value;
	}
	#callSubscribers() {
		for (const suscriber of this.#subscribers) {
			return suscriber(this.#value);
		}
	}
	dispatchEvent(event: string, value: T): any {
		if (event === 'set') {
			this.#value = value;
			this.#callSubscribers();
		}
	}
	get() {
		return this.#value;
	}
	set(value: T) {
		if (!isESNodeType(this, ESNode)) return;
		this.dispatchEvent('set', value);
	}
	subscribe(fn: (arg: T) => any) {
		this.#subscribers.add(fn);
		fn(this.#value);
		return () => this.#subscribers.delete(fn);
	}
	abstract toJSON() : JsonValue;
}
