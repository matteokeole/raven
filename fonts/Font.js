/**
 * @typedef {Object} FontDescriptor
 * @property {Number} lineSpacing
 */

/**
 * @abstract
 */
export class Font {
	/**
	 * @type {Number}
	 */
	#lineSpacing;

	/**
	 * @param {FontDescriptor} descriptor
	 */
	constructor(descriptor) {
		this.#lineSpacing = descriptor.lineSpacing;
	}

	getLineSpacing() {
		return this.#lineSpacing;
	}
}