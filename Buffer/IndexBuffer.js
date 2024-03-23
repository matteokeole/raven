import {Buffer} from "./Buffer.js";

/**
 * @abstract
 */
export class IndexBuffer extends Buffer {
	/**
	 * @type {Object}
	 */
	_format;

	getFormat() {
		return this._format;
	}
}