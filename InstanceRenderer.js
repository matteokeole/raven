import {WebGLRenderer} from "./WebGLRenderer.js";
import {NoWebGL2Error} from "./Error/index.js";
import {ShaderLoader} from "./Loader/index.js";

/**
 * @abstract
 */
export class InstanceRenderer extends WebGLRenderer {
	/**
	 * @type {?HTMLCanvasElement}
	 */
	_canvas;

	/**
	 * @type {Number}
	 */
	#compositeCount;

	constructor() {
		super();

		this._canvas = null;
		this.#compositeCount = 0;
	}

	getCanvas() {
		return this._canvas;
	}

	/**
	 * @param {Number} compositeCount
	 */
	setCompositeCount(compositeCount) {
		this.#compositeCount = compositeCount;
	}

	/**
	 * @param {String} shaderPath
	 */
	async build(shaderPath) {
		this._canvas = document.createElement("canvas");
		this._context = this._canvas.getContext("webgl2");

		if (this._context === null) {
			throw new NoWebGL2Error();
		}

		this._context.pixelStorei(this._context.UNPACK_FLIP_Y_WEBGL, true);
		this._context.enable(this._context.BLEND);
		this._context.blendFunc(this._context.SRC_ALPHA, this._context.ONE_MINUS_SRC_ALPHA);

		const loader = new ShaderLoader(shaderPath);
		const vertexShaderSource = await loader.load("instance.vert");
		const fragmentShaderSource = await loader.load("instance.frag");

		const program = this._createProgram(vertexShaderSource, fragmentShaderSource);

		this._context.useProgram(program);

		this._programs.push(program);
		this._attributes.vertex = 0;
		this._buffers.vertex = this._context.createBuffer();

		this._context.enableVertexAttribArray(this._attributes.vertex);
		this._context.bindBuffer(this._context.ARRAY_BUFFER, this._buffers.vertex);
		this._context.vertexAttribPointer(this._attributes.vertex, 2, this._context.FLOAT, false, 0, 0);
		this._context.bufferData(this._context.ARRAY_BUFFER, new Float32Array([
			 1,  1,
			-1,  1,
			-1, -1,
			 1, -1,
		]), this._context.STATIC_DRAW);

		for (let i = 0; i < this.#compositeCount; i++) {
			this._context.bindTexture(this._context.TEXTURE_2D, this._textures[i] = this._context.createTexture());
			this._context.texParameteri(this._context.TEXTURE_2D, this._context.TEXTURE_MIN_FILTER, this._context.LINEAR);
		}
	}

	render() {
		for (let i = 0; i < this.#compositeCount; i++) {
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