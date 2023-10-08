import {Font} from "./Font.js";
import {Subcomponent} from "../gui/index.js";
import {Vector2, Vector4} from "../math/index.js";

/**
 * @typedef {Object} GlyphMapEntry
 * @property {Number} width
 * @property {[Number, Number]} uv
 */

export class BitmapFont extends Font {
	/**
	 * @type {String}
	 */
	#glyphMapPath;

	/**
	 * @type {String}
	 */
	#texturePath;

	/**
	 * @type {?Object.<String, GlyphMapEntry>}
	 */
	#glyphMap;

	/**
	 * @type {?Object.<String, Subcomponent>}
	 */
	#glyphs;

	/**
	 * @type {Number}
	 */
	#tileHeight;

	/**
	 * @type {Number}
	 */
	#tileSpacing;

	/**
	 * @type {Object.<String, Number>}
	 */
	#customTileWidths;

	/**
	 * @param {Object} options
	 * @param {String} options.glyphMapPath
	 * @param {String} options.texturePath
	 * @param {Number} options.tileHeight
	 * @param {Number} [options.tileSpacing]
	 * @param {Object.<String, Number>} [options.customTileWidths]
	 */
	constructor({glyphMapPath, texturePath, tileHeight, tileSpacing = 0, customTileWidths = {}}) {
		super();

		this.#glyphMapPath = glyphMapPath;
		this.#texturePath = texturePath;
		this.#glyphMap = null;
		this.#glyphs = null;
		this.#tileHeight = tileHeight;
		this.#tileSpacing = tileSpacing;
		this.#customTileWidths = customTileWidths;
	}

	/**
	 * @returns {String}
	 */
	getGlyphMapPath() {
		return this.#glyphMapPath;
	}

	/**
	 * @returns {String}
	 */
	getTexturePath() {
		return this.#texturePath;
	}

	/**
	 * @returns {?Object.<String, GlyphMapEntry>}
	 */
	getGlyphMap() {
		return this.#glyphMap;
	}

	/**
	 * @returns {?Object.<String, Subcomponent>}
	 */
	getGlyphs() {
		return this.#glyphs;
	}

	/**
	 * @param {String} glyph
	 * @returns {Number}
	 */
	getTileWidth(glyph) {
		return this.#customTileWidths[glyph] ?? this.#glyphs[glyph].getSize()[0];
	}

	/**
	 * @returns {Number}
	 */
	getTileHeight() {
		return this.#tileHeight;
	}

	/**
	 * @returns {Number}
	 */
	getTileSpacing() {
		return this.#tileSpacing;
	}

	/**
	 * @returns {Object.<String, Number>}
	 */
	getCustomTileWidths() {
		return this.#customTileWidths;
	}

	/**
	 * @param {String} basePath
	 */
	async loadGlyphMap(basePath) {
		const response = await fetch(`${basePath}${this.#glyphMapPath}`);
		const json = await response.json();

		this.#glyphMap = json;
		this.#glyphs = {};

		for (let i = 0, glyphs = Object.entries(this.#glyphMap), l = glyphs.length, glyph, tile; i < l; i++) {
			/** @type {String} */
			glyph = glyphs[i][0];

			/** @type {GlyphMapEntry} */
			tile = glyphs[i][1];

			this.#glyphs[glyph] = new Subcomponent({
				size: new Vector2(tile.width, this.#tileHeight),
				offset: new Vector2(),
				uv: new Vector2(tile.uv[0], tile.uv[1]),
			});
		}
	}

	/**
	 * Note: Newlines are not supported.
	 * 
	 * @param {String} string
	 * @param {Vector4} colorMask
	 * @returns {Subcomponent[]}
	 * @throws {Error}
	 */
	generateGlyphsFromString(string, colorMask) {
		if (string.includes("\n")) {
			throw new Error("Newlines are not supported.");
		}

		const glyphs = [];
		let width = 0;

		for (let i = 0, l = string.length, glyph; i < l; i++) {
			if (!(string[i] in this.#glyphs)) continue;

			glyph = this.#glyphs[string[i]].clone();
			glyph.setOffset(new Vector2(width, 0));
			glyph.setColorMask(colorMask);

			glyphs.push(glyph);

			width += this.getTileWidth(string[i]) + this.getTileSpacing();
		}

		return {glyphs, width};
	}
}