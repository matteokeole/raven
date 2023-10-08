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
	 * @type {?Object.<String, GlyphMapEntry>}
	 */
	#glyphMap;

	/**
	 * @type {?Object.<String, Subcomponent>}
	 */
	#glyphs;

	/**
	 * @type {String}
	 */
	#texturePath;

	/**
	 * @type {Number}
	 */
	#tileHeight;

	/**
	 * @type {Number}
	 */
	#tileSpacing;

	/**
	 * @param {Object} options
	 * @param {String} options.texturePath
	 * @param {Number} options.tileHeight
	 * @param {Number} [options.tileSpacing]
	 */
	constructor({texturePath, tileHeight, tileSpacing = 0}) {
		super();

		this.#glyphMap = null;
		this.#glyphs = null;
		this.#texturePath = texturePath;
		this.#tileHeight = tileHeight;
		this.#tileSpacing = tileSpacing;
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
	 * @returns {String}
	 */
	getTexturePath() {
		return this.#texturePath;
	}

	/**
	 * @param {Subcomponent}
	 * @returns {Number}
	 */
	getTileWidth(glyph) {
		return glyph.getSize()[0];
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
	 * @param {String} glyphMapPath
	 */
	async loadGlyphs(glyphMapPath) {
		const response = await fetch(glyphMapPath);
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
			glyph = (this.#glyphs[string[i]] ?? this.#glyphs[""]).clone();
			glyph.setOffset(new Vector2(width, 0));
			glyph.setColorMask(colorMask);

			glyphs.push(glyph);

			width += this.getTileWidth(glyph) + this.getTileSpacing();
		}

		return {glyphs, width};
	}
}