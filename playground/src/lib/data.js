import { ESNumber } from '$eventscript/nodes/esnumber.js';

export class Index extends ESNumber {
	constructor(value = 0) {
		super(value);
	}
	increment() {
		return super.set(super.toJSON() + 1);
	}
	set() {}
}
