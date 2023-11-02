import {WebGLRenderer} from "./WebGLRenderer.js";
import {NoWebGL2Error} from "./errors/index.js";

export class InstanceRenderer extends WebGLRenderer {
	/**
	 * @type {?HTMLCanvasElement}
	 */
	_canvas;

	/**
	 * @type {Number}
	 */
	_compositeCount;

	/**
	 * @type {String}
	 */
	_shaderPath;

	constructor() {
		super();

		this._canvas = null;
		this._compositeCount = 0;
		this._shaderPath = "";
	}

	/**
	 * @returns {?HTMLCanvasElement}
	 */
	getCanvas() {
		return this._canvas;
	}

	/**
	 * @param {Number} compositeCount
	 */
	setCompositeCount(compositeCount) {
		this._compositeCount = compositeCount;
	}

	/**
	 * @param {String} shaderPath
	 */
	setShaderPath(shaderPath) {
		this._shaderPath = shaderPath;
	}

	/**
	 * @inheritdoc
	 */
	build() {
		super.build();

		this._canvas = document.createElement("canvas");
		this._context = this._canvas.getContext("webgl2");

		if (this._context === null) {
			throw new NoWebGL2Error();
		}
	}

	dispose() {
		super.dispose();

		this._canvas.remove();
		this._canvas = null;
	}
}