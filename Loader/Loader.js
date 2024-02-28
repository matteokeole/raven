import {NotImplementedError} from "../Error/index.js";

/**
 * @abstract
 */
export class Loader {
	/**
	 * @type {String}
	 */
	_basePath;

	/**
	 * @param {String} basePath
	 */
	constructor(basePath) {
		this._basePath = basePath;
	}

	/**
	 * @abstract
	 * @param {*} data
	 * @returns {Promise.<*>}
	 */
	async load(data) {
		throw new NotImplementedError();
	}
}