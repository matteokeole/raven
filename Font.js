import {Subcomponent} from "./gui/index.js";

/**
 * @param {Object} options
 * @param {String} options.name
 * @param {String} options.texturePath
 * @param {Number} options.letterHeight
 * @param {Number} options.letterSpacing
 */
export function Font({name, texturePath, letterHeight, letterSpacing}) {
	/** @param {?Object} */
	let data;

	/** @param {?Object<String, Subcomponent>} */
	let characters;

	texturePath = `${texturePath}${name}.png`;

	/** @returns {?Object} */
	this.getData = () => data;

	/** @param {Object} value */
	this.setData = value => void (data = value);

	/** @returns {?Object<String, Subcomponent>} */
	this.getCharacters = () => characters;

	/** @param {Object<String, Subcomponent>} value */
	this.setCharacters = value => void (characters = value);

	/** @returns {String} */
	this.getName = () => name;

	/** @returns {String} */
	this.getTexturePath = () => texturePath;

	/** @returns {Number} */
	this.getLetterHeight = () => letterHeight;

	/** @returns {Number} */
	this.getLetterSpacing = () => letterSpacing;
}

/** @param {String} fontPath */
Font.prototype.load = async function(fontPath) {
	this.setData(
		await (await fetch(`${fontPath}${this.getName()}.json`)).json(),
	);
};