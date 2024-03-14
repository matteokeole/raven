import {BitmapFont} from "./BitmapFont.js";

/**
 * @typedef {Object} MonospacedBitmapFontDescriptor
 * @property {String} glyphMapPath
 * @property {String} texturePath
 * @property {Number} tileWidth
 * @property {Number} tileHeight
 * @property {Number} [tileSpacing]
 * @property {Number} [lineSpacing]
 * @property {Record.<String, Number>} [customTileWidths]
 * @property {Record.<String, Number>} [customTileOffsets]
 */

export class MonospacedBitmapFont extends BitmapFont {
	/**
	 * @type {Number}
	 */
	#tileWidth;

	/**
	 * @param {MonospacedBitmapFontDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#tileWidth = descriptor.tileWidth;
	}

	getTileWidth() {
		return this.#tileWidth;
	}
}