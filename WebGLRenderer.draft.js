import {Vector4} from "./math/index.js";

export class WebGL2Renderer {
	/**
	 * @type {?OffscreenCanvas}
	 */
	#canvas;

	/**
	 * @type {?WebGL2RenderingContext}
	 */
	#context;

	/**
	 * @type {Vector4}
	 */
	#viewport;

	constructor() {
		this.#viewport = new Vector4();
	}

	/**l
	 * @returns {?OffscreenCanvas}
	 */
	getCanvas() {
		return this.#canvas;
	}

	/**
	 * @returns {?WebGL2RenderingContext}
	 */
	getContext() {
		return this.#context;
	}

	/**
	 * @returns {Vector4}
	 */
	getViewport() {
		return this.#viewport;
	}

	build() {
		//
	}

	dispose() {
		//
	}
}