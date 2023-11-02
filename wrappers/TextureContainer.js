import {Vector2} from "../math/index.js";

export class TextureContainer {
	/**
	 * @type {Uint8Array|HTMLImageElement}
	 */
	#image;

	/**
	 * @type {Vector2}
	 */
	#viewport;

	/**
	 * @type {Number}
	 */
	#index;

	/**
	 * @param {Object} options
	 * @param {Uint8Array|HTMLImageElement} options.image
	 * @param {Vector2} options.viewport
	 * @param {Number} options.index
	 */
	constructor({image, viewport, index}) {
		this.#image = image;
		this.#viewport = viewport;
		this.#index = index;
	}

	/**
	 * @returns {Uint8Array|HTMLImageElement}
	 */
	getImage() {
		return this.#image;
	}

	/**
	 * @returns {Vector2}
	 */
	getViewport() {
		return this.#viewport;
	}

	/**
	 * @returns {Number}
	 */
	getIndex() {
		return this.#index;
	}
}