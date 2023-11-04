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

	/**
	 * @inheritdoc
	 */
	render() {
		for (let i = 0; i < this._compositeCount; i++) {
			this._context.bindTexture(this._context.TEXTURE_2D, this._textures[i]);
			this._context.drawArrays(this._context.TRIANGLE_FAN, 0, 4);
		}
	}

	/**
	 * @param {Number} index
	 * @param {OffscreenCanvas} texture
	 */
	updateCompositeTexture(index, texture) {
		this._context.bindTexture(this._context.TEXTURE_2D, this._textures[index]);
		/**
		 * @todo Replace by `texStorage2D` (lower memory costs in some implementations,
		 * according to {@link https://registry.khronos.org/webgl/specs/latest/2.0/#3.7.6})
		 */
		this._context.texImage2D(
			this._context.TEXTURE_2D,
			0,
			this._context.RGBA,
			this._context.RGBA,
			this._context.UNSIGNED_BYTE,
			texture,
		);
	}
}