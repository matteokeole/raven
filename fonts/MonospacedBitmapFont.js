import {BitmapFont} from "./BitmapFont.js";

export class MonospacedBitmapFont extends BitmapFont {
	/**
	 * @type {Number}
	 */
	#tileWidth;

	/**
	 * @param {Object} options
	 * @param {String} options.glyphMapPath
	 * @param {String} options.texturePath
	 * @param {Number} options.tileWidth
	 * @param {Number} options.tileHeight
	 * @param {Number} [options.tileSpacing]
	 * @param {Number} [options.lineSpacing]
	 * @param {Object.<String, Number>} [options.customTileWidths]
	 */
	constructor({glyphMapPath, texturePath, tileWidth, tileHeight, tileSpacing = 0, lineSpacing = 0, customTileWidths = {}}) {
		super({glyphMapPath, texturePath, tileHeight, tileSpacing, lineSpacing, customTileWidths});

		this.#tileWidth = tileWidth;
	}

	/**
	 * @returns {Number}
	 */
	getTileWidth() {
		return this.#tileWidth;
	}
}