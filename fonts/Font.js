/**
 * @abstract
 */
export class Font {
	/**
	 * @type {Number}
	 */
	#lineSpacing;

	/**
	 * @param {Object} options
	 * @param {Number} options.lineSpacing
	 */
	constructor({lineSpacing}) {
		this.#lineSpacing = lineSpacing;
	}

	/**
	 * @returns {Number}
	 */
	getLineSpacing() {
		return this.#lineSpacing;
	}
}