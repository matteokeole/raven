import {Buffer} from "./Buffer.js";

/**
 * @abstract
 */
export class IndexBuffer extends Buffer {
	/**
	 * @type {Object}
	 */
	_type;

	getType() {
		return this._type;
	}
}