import {BitmapFont} from "./BitmapFont.js";

export class MonospacedBitmapFont extends BitmapFont {
	/**
	 * @type {Number}
	 */
	#tileWidth;

	/**
	 * @param {Object} options
	 * @param {Number} options.tileWidth
	 */
	constructor({tileWidth}) {
		super(arguments[0]);

		this.#tileWidth = tileWidth;
	}

	/**
	 * @inheritdoc
	 * @returns {Number}
	 */
	getTileWidth() {
		return this.#tileWidth;
	}
}