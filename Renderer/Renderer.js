import {IndexBuffer, VertexBuffer} from "../Buffer/index.js";
import {NotImplementedError} from "../Error/index.js";

/**
 * @abstract
 */
export class Renderer {
	/**
	 * @type {null|HTMLCanvasElement|OffscreenCanvas}
	 */
	_canvas;

	getCanvas() {
		return this._canvas;
	}

	/**
	 * @abstract
	 * @param {ArrayBuffer} indices
	 * @returns {IndexBuffer}
	 */
	_createIndexBuffer(indices) {
		throw new NotImplementedError();
	}

	/**
	 * @abstract
	 * @param {ArrayBuffer} vertices
	 * @returns {VertexBuffer}
	 */
	_createVertexBuffer(vertices) {
		throw new NotImplementedError();
	}
}