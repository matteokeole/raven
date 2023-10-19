import {Vector4} from "./math/index.js";

/**
 * @abstract
 */
export class WebGLRenderer {
	/**
	 * @type {null|HTMLCanvasElement|OffscreenCanvas}
	 */
	_canvas;

	/**
	 * @type {?WebGL2RenderingContext}
	 */
	_context;

	/**
	 * @type {Vector4}
	 */
	#viewport;

	/**
	 * @type {WebGLProgram[]}
	 */
	_programs;

	/**
	 * @type {Object.<String, Number>}
	 */
	_attributes;

	/**
	 * @type {Object.<String, WebGLUniformLocation>}
	 */
	_uniforms;

	/**
	 * @type {Object.<String, WebGLBuffer>}
	 */
	_buffers;

	/**
	 * @type {Object.<String, WebGLTexture>}
	 */
	_textures;

	constructor() {
		this._canvas = null;
		this._context = null
		this.#viewport = new Vector4();
		this._programs = [];
		this._attributes = {};
		this._uniforms = {};
		this._buffers = {};
		this._textures = {};
	}

	/**
	 * @returns {null|HTMLCanvasElement|OffscreenCanvas}
	 */
	getCanvas() {
		return this._canvas;
	}

	/**
	 * @returns {?WebGL2RenderingContext}
	 */
	getContext() {
		return this._context;
	}

	/**
	 * @returns {Vector4}
	 */
	getViewport() {
		return this.#viewport;
	}

	build() {
		this._context = this._canvas.getContext("webgl2");
	}

	/**
	 * @todo Include already set textureCount
	 * @todo Handle dimension overflow error
	 * @todo Handle unbound TEXTURE_2D_ARRAY error
	 * @param {Object.<String, TexImageSource>} textures
	 */
	loadTextures(textures) {
		if (this._context.getParameter(this._context.TEXTURE_BINDING_2D_ARRAY) === null) {
			// throw new ReferenceError("No texture array bound to the context");

			this._context.bindTexture(this._context.TEXTURE_2D_ARRAY, this._context.createTexture());
			this._context.texParameteri(this._context.TEXTURE_2D_ARRAY, this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);
			this._context.generateMipmap(this._context.TEXTURE_2D_ARRAY);
			this._context.texStorage3D(this._context.TEXTURE_2D_ARRAY, 1, this._context.RGBA8, 256, 256, 1);
		}

		const keys = Object.getOwnPropertyNames(textures);

		for (let i = 0, length = keys.length, key, source; i < length; i++) {
			key = keys[i];
			source = textures[key];

			this._context.texSubImage3D(
				this._context.TEXTURE_2D_ARRAY,
				0,
				0,
				0,
				i,
				source.width ?? 1,
				source.height ?? 1,
				1,
				this._context.RGBA,
				this._context.UNSIGNED_BYTE,
				source,
			);

			this._textures[key] = source;
		}

		console.log(this._textures);
	}

	/**
	 * @see {@link https://registry.khronos.org/webgl/extensions/WEBGL_lose_context}
	 */
	dispose() {
		this._context.getExtension("WEBGL_lose_context").loseContext();
		this._context = null;
	}
}