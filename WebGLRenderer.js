import {ShaderCompilationError} from "./errors/index.js";
import {Vector2, Vector4} from "./math/index.js";
import {TextureContainer} from "./wrappers/index.js";

/**
 * @abstract
 */
export class WebGLRenderer {
	/**
	 * @type {Vector2}
	 */
	static MAX_TEXTURE_SIZE = new Vector2(256, 256);

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
	 * Note: This doesn't represent all the existing `WebGLTexture` instances,
	 * but rather the images uploaded by the user using `WebGLRenderer#createTextureArray`
	 * (that are stored inside a `TEXTURE_2D_ARRAY` texture).
	 * 
	 * @type {Object.<String, TextureContainer>}
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
	 * @returns {Vector4}
	 */
	getViewport() {
		return this.#viewport;
	}

	/**
	 * @param {Vector4} viewport
	 */
	setViewport(viewport) {
		this.#viewport = viewport;
		this._canvas.width = viewport[2];
		this._canvas.height = viewport[3];

		this._context.viewport(
			this.#viewport[0],
			this.#viewport[1],
			this.#viewport[2],
			this.#viewport[3],
		);
	}

	/**
	 * @returns {Object.<String, TextureContainer>}
	 */
	getTextures() {
		return this._textures;
	}

	/**
	 * @param {String} name
	 * @returns {?TextureContainer}
	 * @throws {ReferenceError} if no texture has this name
	 */
	getTexture(name) {
		if (!(name in this._textures)) {
			throw new ReferenceError(`Undefined texture name "${name}".`);
		}

		return this._textures[name];
	}

	/**
	 * @abstract
	 */
	build() {}

	/**
	 * @param {String} vertexShaderSource
	 * @param {String} fragmentShaderSource
	 * @returns {WebGLProgram}
	 * @throws {ShaderCompilationError} if the program linking was not successful
	 */
	_createProgram(vertexShaderSource, fragmentShaderSource) {
		const program = this._context.createProgram();
		const vertexShader = this.#createShader(this._context.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = this.#createShader(this._context.FRAGMENT_SHADER, fragmentShaderSource);

		this._context.attachShader(program, vertexShader);
		this._context.attachShader(program, fragmentShader);

		this._context.linkProgram(program);

		if (!this._context.getProgramParameter(program, this._context.LINK_STATUS)) {
			if (this._context.getShaderInfoLog(vertexShader) !== "") {
				throw new ShaderCompilationError(this._context.getShaderInfoLog(vertexShader), "VERTEX SHADER");
			}

			if (this._context.getShaderInfoLog(fragmentShader) !== "") {
				throw new ShaderCompilationError(this._context.getShaderInfoLog(fragmentShader), "FRAGMENT SHADER");
			}
		}

		return program;
	}

	/**
	 * @todo Include already set textureCount
	 * @todo Handle dimension overflow error
	 * @todo Handle unbound TEXTURE_2D_ARRAY error
	 * 
	 * @param {import("./Loader/TextureLoader.js").Image[]} textures
	 * @param {Boolean} generateMipmaps
	 */
	createTextureArray(textures, generateMipmaps) {
		this._context.bindTexture(this._context.TEXTURE_2D_ARRAY, this._context.createTexture());
		this._context.texParameteri(this._context.TEXTURE_2D_ARRAY, this._context.TEXTURE_MAG_FILTER, this._context.NEAREST);

		if (generateMipmaps) {
			this._context.generateMipmap(this._context.TEXTURE_2D_ARRAY);
		} else {
			this._context.texParameteri(this._context.TEXTURE_2D_ARRAY, this._context.TEXTURE_MIN_FILTER, this._context.LINEAR);
		}

		const length = textures.length;

		this._context.texStorage3D(this._context.TEXTURE_2D_ARRAY, 1, this._context.RGBA8, WebGLRenderer.MAX_TEXTURE_SIZE[0], WebGLRenderer.MAX_TEXTURE_SIZE[1], length);

		for (let i = 0, texture; i < length; i++) {
			texture = textures[i];

			this._context.texSubImage3D(
				this._context.TEXTURE_2D_ARRAY,
				0,
				0,
				0,
				i,
				texture.viewport[0],
				texture.viewport[1],
				1,
				this._context.RGBA,
				this._context.UNSIGNED_BYTE,
				texture.image,
			);

			this._textures[texture.name] = new TextureContainer({
				image: texture.image,
				index: i,
				viewport: texture.viewport,
			});
		}
	}

	/**
	 * @abstract
	 */
	render() {}

	/**
	 * Warning: this clears the whole canvas; prefer targeting only specific parts when possible.
	 */
	clear() {
		this._context.clear(this._context.COLOR_BUFFER_BIT | this._context.DEPTH_BUFFER_BIT);
	}

	/**
	 * @see {@link https://registry.khronos.org/webgl/extensions/WEBGL_lose_context}
	 */
	dispose() {
		this._context.getExtension("WEBGL_lose_context").loseContext();
		this._context = null;
	}

	/**
	 * @param {GLint} type
	 * @param {String} source
	 * @returns {WebGLShader}
	 */
	#createShader(type, source) {
		const shader = this._context.createShader(type);

		this._context.shaderSource(shader, source);
		this._context.compileShader(shader);

		return shader;
	}
}