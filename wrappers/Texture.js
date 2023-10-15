export class Texture {
	/**
	 * @type {HTMLImageElement}
	 */
	#image;

	/**
	 * @type {Number}
	 */
	#index;

	/**
	 * @param {HTMLImageElement} image
	 * @param {Number} index
	 */
	constructor(image, index) {
		this.#image = image;
		this.#index = index;
	}

	/**
	 * @returns {HTMLImageElement}
	 */
	getImage() {
		return this.#image;
	}

	/**
	 * @returns {Number}
	 */
	getIndex() {
		return this.#index;
	}
}