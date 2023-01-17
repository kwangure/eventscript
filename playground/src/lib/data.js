import { ESNumber }  from '$eventscript/nodes/esnumber.js';

export class Index extends ESNumber {
	constructor(value = 0) {
		super(value);
	}
	/**
	 * @param {string} event
	 */
	dispatchEvent(event) {
		if (event === 'increment') {
			super.dispatchEvent('set', super.valueOf() + 1);
		}
	}
	increment() {
		super.dispatchEvent('set', super.valueOf() + 1);
	}
}