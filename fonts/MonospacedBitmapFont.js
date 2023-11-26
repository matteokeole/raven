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
	 * @param {Record.<String, Number>} [options.customTileWidths]
	 */
	constructor({glyphMapPath, texturePath, tileWidth, tileHeight, tileSpacing = 0, lineSpacing = 0, customTileWidths = {}}) {
		super({glyphMapPath, texturePath, tileHeight, tileSpacing, lineSpacing, customTileWidths});

		this.#tileWidth = tileWidth;
	}

	getTileWidth() {
		return this.#tileWidth;
	}
}