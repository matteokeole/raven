/**
 * Base class for DOM/custom events passing through a GUI.
 * 
 * @abstract
 * @template T
 */
export class Event {
	static NAME = "default";

	/**
	 * The data that this event carries.
	 */
	#carry;

	/**
	 * @param {T} carry
	 */
	constructor(carry) {
		this.#carry = carry;
	}

	getCarry() {
		return this.#carry;
	}
}