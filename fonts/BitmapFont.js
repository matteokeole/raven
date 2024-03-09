import {Font} from "./Font.js";
import {Subcomponent} from "../gui/index.js";
import {Vector2, Vector4, max} from "../math/index.js";

/**
 * @typedef {Object} BitmapFontDescriptor
 * @property {String} glyphMapPath
 * @property {String} texturePath
 * @property {Number} tileHeight
 * @property {Number} [tileSpacing]
 * @property {Number} [lineSpacing]
 * @property {Record.<String, Number>} [customTileWidths]
 * @property {Record.<String, Number>} [customTileOffsets]
 */

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
	 * @type {?Record.<String, GlyphMapEntry>}
	 */
	#glyphMap;

	/**
	 * @type {?Record.<String, Subcomponent>}
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
	 * @type {Record.<String, Number>}
	 */
	#customTileWidths;

	/**
	 * @type {Record.<String, Number>}
	 */
	#customTileOffsets;

	/**
	 * @param {BitmapFontDescriptor} descriptor
	 */
	constructor(descriptor) {
		super({
			lineSpacing: descriptor.lineSpacing ?? 0,
		});

		this.#glyphMapPath = descriptor.glyphMapPath;
		this.#texturePath = descriptor.texturePath;
		this.#glyphMap = null;
		this.#glyphs = null;
		this.#tileHeight = descriptor.tileHeight;
		this.#tileSpacing = descriptor.tileSpacing ?? 0;
		this.#customTileWidths = descriptor.customTileWidths ?? {};
		this.#customTileOffsets = descriptor.customTileOffsets ?? {};
	}

	getGlyphMapPath() {
		return this.#glyphMapPath;
	}

	getTexturePath() {
		return this.#texturePath;
	}

	getGlyphMap() {
		return this.#glyphMap;
	}

	getGlyphs() {
		return this.#glyphs;
	}

	/**
	 * @param {String} glyph
	 */
	getTileWidth(glyph) {
		if (!(glyph in this.#customTileWidths)) {
			return this.#glyphs[glyph].getSize()[0];
		}

		return this.#customTileWidths[glyph];
	}

	getTileHeight() {
		return this.#tileHeight;
	}

	/**
	 * @param {String} glyph
	 */
	getTileOffset(glyph) {
		if (!(glyph in this.#customTileOffsets)) {
			return 0;
		}

		return this.#customTileOffsets[glyph];
	}

	getTileSpacing() {
		return this.#tileSpacing;
	}

	getCustomTileWidths() {
		return this.#customTileWidths;
	}

	getCustomTileOffsets() {
		return this.#customTileOffsets;
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
			/**
			 * @type {String}
			 */
			glyph = glyphs[i][0];

			/**
			 * @type {GlyphMapEntry}
			 */
			tile = glyphs[i][1];

			this.#glyphs[glyph] = new Subcomponent({
				size: new Vector2(tile.width, this.#tileHeight),
				offset: new Vector2(),
				uv: new Vector2(tile.uv[0], tile.uv[1]),
			});
		}
	}

	/**
	 * @todo Typedef the return object or return directly a Text component?
	 * @see {generateGlyphsFromMultilineString} for handling multi-line strings
	 * 
	 * Generates an array of glyph subcomponents from a single-line string.
	 * 
	 * @param {String} string
	 * @param {Number} fontSize
	 * @param {Vector4} colorMask
	 * @throws {Error} if the string contains newlines
	 */
	generateGlyphsFromString(string, fontSize, colorMask) {
		if (string.includes("\n")) {
			throw new Error("Please use generateGlyphsFromMultilineString to include newlines in your string.");
		}

		const glyphs = [];
		const size = new Vector2(0, this.#tileHeight);

		for (let i = 0, l = string.length, glyph; i < l; i++) {
			if (!(string[i] in this.#glyphs)) {
				continue;
			}

			glyph = this.#glyphs[string[i]].clone();
			glyph.setOffset(new Vector2(size[0] + this.getTileOffset(string[i]), 0));
			glyph.setScale(new Vector2(fontSize, fontSize));
			glyph.setColorMask(new Vector4(colorMask));

			glyphs.push(glyph);

			size[0] += (this.getTileWidth(string[i]) + this.#tileSpacing) * fontSize;
		}

		return {glyphs, size};
	}

	/**
	 * @todo Typedef the return object or return directly a Text component?
	 * 
	 * Generates an array of glyph subcomponents from a multi-line string.
	 * 
	 * @param {String} string Can be multiline
	 * @param {Number} fontSize
	 * @param {Vector4} colorMask
	 */
	generateGlyphsFromMultilineString(string, fontSize, colorMask) {
		const lines = string.split("\n");

		const glyphs = [];
		const size = new Vector2();

		for (let i = 0, lineLength = lines.length, line; i < lineLength; i++) {
			line = lines[i];

			let lineWidth = 0;

			for (let j = 0, characterLength = line.length, glyph; j < characterLength; j++) {
				if (!(line[j] in this.#glyphs)) {
					continue;
				}

				glyph = this.#glyphs[line[j]].clone();
				glyph.setOffset(new Vector2(lineWidth + this.getTileOffset(line[j]), size[1]));
				glyph.setScale(new Vector2(fontSize, fontSize));
				glyph.setColorMask(new Vector4(colorMask));

				glyphs.push(glyph);

				lineWidth += (this.getTileWidth(line[j]) + this.#tileSpacing) * fontSize;
			}

			size[0] = max(size[0], lineWidth);
			size[1] += (this.#tileHeight + this.getLineSpacing()) * fontSize;
		}

		return {glyphs, size};
	}
}