import {Vector2} from "../math/index.js";

/**
 * @typedef {Object} TextureWrapperDescriptor
 * @property {HTMLImageElement|Uint8Array} image
 * @property {Vector2} viewport
 * @property {Number} index
 */

export class TextureWrapper {
	/**
	 * @type {HTMLImageElement|Uint8Array}
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
	 * @param {TextureWrapperDescriptor} descriptor
	 */
	constructor({image, viewport, index}) {
		this.#image = image;
		this.#viewport = viewport;
		this.#index = index;
	}

	getImage() {
		return this.#image;
	}

	getViewport() {
		return this.#viewport;
	}

	getIndex() {
		return this.#index;
	}
}