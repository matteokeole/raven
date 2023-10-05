import {Subcomponent} from "./gui/index.js";

export class Font {
	/** @param {?Object} */
	#data;

	/** @param {?Object.<String, Subcomponent>} */
	#characters;

	/** @param {String} */
	#name;

	/** @param {String} */
	#texturePath;

	/** @param {?Number} */
	#monospaceLetterWidth;

	/** @param {Number} */
	#letterHeight;

	/** @param {Number} */
	#letterSpacing;

	/**
	 * @param {Object} options
	 * @param {String} options.name Used to refer to the font in layers
	 * @param {String} options.texturePath Parent directory path (the filename is deduced from the `name` property)
	 * @param {?Number} options.monospaceLetterWidth Character width (monospace fonts only)
	 * @param {Number} options.letterHeight
	 * @param {Number} options.letterSpacing
	 */
	constructor({name, texturePath, monospaceLetterWidth, letterHeight, letterSpacing}) {
		this.#name = name;
		this.#texturePath = `${texturePath}${name}.png`;
		this.#monospaceLetterWidth = monospaceLetterWidth;
		this.#letterHeight = letterHeight;
		this.#letterSpacing = letterSpacing;
	}

	/** @returns {?Object} */
	getData() {
		return this.#data;
	}

	/** @param {?Object} data */
	setData(data) {
		this.#data = data;
	}

	/** @returns {?Object.<String, Subcomponent>} */
	getCharacters() {
		return this.#characters;
	}

	/** @param {?Object.<String, Subcomponent>} characters */
	setCharacters(characters) {
		this.#characters = characters;
	}

	/** @returns {String} */
	getName() {
		return this.#name;
	}

	/** @returns {String} */
	getTexturePath() {
		return this.#texturePath;
	}

	/** @returns {?Number} */
	getMonospaceLetterWidth() {
		return this.#monospaceLetterWidth;
	}

	/** @returns {Number} */
	getLetterHeight() {
		return this.#letterHeight;
	}

	/** @returns {Number} */
	getLetterSpacing() {
		return this.#letterSpacing;
	}

	/** @param {String} fontPath */
	async load(fontPath) {
		const response = await fetch(`${fontPath}${this.#name}.json`);
		const json = await response.json();

		this.#data = json;
	}
}