import {Renderer} from "../Renderer.js";
import {IndexBuffer, VertexBuffer} from "../../Buffer/index.js";
import {WebGLIndexBuffer, WebGLVertexBuffer} from "../../Buffer/WebGL/index.js";
import {ProgramLinkingError, ShaderCompilationError} from "../../Error/index.js";
import {Matrix, Vector2, Vector4} from "../../math/index.js";
import {Scene} from "../../Scene/Scene.js";
import {TextureWrapper} from "../../Wrapper/index.js";

/**
 * @abstract
 */
export class WebGLRenderer extends Renderer {
	/**
	 * @type {Vector2}
	 */
	static MAX_TEXTURE_SIZE = new Vector2(256, 256);

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
	 * @type {Record.<String, Number>}
	 */
	_attributes;

	/**
	 * @type {Record.<String, WebGLUniformLocation>}
	 */
	_uniforms;

	/**
	 * @type {Record.<String, WebGLBuffer>}
	 */
	_buffers;

	/**
	 * Note: This doesn't represent all the existing `WebGLTexture` instances,
	 * but rather the images uploaded by the user using `WebGLRenderer#createTextureArray`
	 * (that are stored inside a `TEXTURE_2D_ARRAY` texture).
	 * 
	 * @type {Record.<String, TextureWrapper>}
	 */
	_textures;

	constructor() {
		super();

		this._canvas = null;
		this._context = null
		this.#viewport = new Vector4();
		this._programs = [];
		this._attributes = {};
		this._uniforms = {};
		this._buffers = {};
		this._textures = {};
	}

	getCanvas() {
		return this._canvas;
	}

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

	getTextures() {
		return this._textures;
	}

	/**
	 * @param {String} name
	 * @returns {?TextureWrapper}
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
	 * @param {String} shaderPath
	 */
	async build(shaderPath) {}

	/**
	 * @param {String} vertexShaderSource
	 * @param {String} fragmentShaderSource
	 * @throws {ProgramLinkingError} if the program linking failed
	 * @throws {ShaderCompilationError} if the vertex shader or fragment shader compilation failed
	 */
	_createProgram(vertexShaderSource, fragmentShaderSource) {
		const vertexShader = this._context.createShader(this._context.VERTEX_SHADER);

		this._context.shaderSource(vertexShader, vertexShaderSource);
		this._context.compileShader(vertexShader);

		/**
		 * @type {GLboolean}
		 */
		let compileStatus = this._context.getShaderParameter(vertexShader, this._context.COMPILE_STATUS);

		if (!compileStatus) {
			const log = this._context.getShaderInfoLog(vertexShader);

			this._context.deleteShader(vertexShader);

			throw new ShaderCompilationError(this._context.VERTEX_SHADER, log);
		}

		const fragmentShader = this._context.createShader(this._context.FRAGMENT_SHADER);

		this._context.shaderSource(fragmentShader, fragmentShaderSource);
		this._context.compileShader(fragmentShader);

		compileStatus = this._context.getShaderParameter(fragmentShader, this._context.COMPILE_STATUS);

		if (!compileStatus) {
			const log = this._context.getShaderInfoLog(fragmentShader);

			this._context.deleteShader(vertexShader);
			this._context.deleteShader(fragmentShader);

			throw new ShaderCompilationError(this._context.FRAGMENT_SHADER, log);
		}

		const program = this._context.createProgram();

		this._context.attachShader(program, vertexShader);
		this._context.attachShader(program, fragmentShader);
		this._context.linkProgram(program);

		/**
		 * @type {GLboolean}
		 */
		const linkStatus = this._context.getProgramParameter(program, this._context.LINK_STATUS);

		if (!linkStatus) {
			const log = this._context.getProgramInfoLog(program);

			this._context.deleteShader(vertexShader);
			this._context.deleteShader(fragmentShader);
			this._context.deleteProgram(program);

			throw new ProgramLinkingError(log);
		}

		this._context.detachShader(program, vertexShader);
		this._context.detachShader(program, fragmentShader);

		return program;
	}

	/**
	 * Note: Index buffers can only store unsigned bytes.
	 * 
	 * @param {ArrayBuffer} indices
	 * @returns {IndexBuffer}
	 */
	_createIndexBuffer(indices) {
		return new WebGLIndexBuffer(this._context, indices, this._context.UNSIGNED_BYTE);
	}

	/**
	 * @param {ArrayBuffer} vertices
	 * @returns {VertexBuffer}
	 */
	_createVertexBuffer(vertices) {
		return new WebGLVertexBuffer(this._context, vertices);
	}

	/**
	 * @param {import("../Loader/TextureLoader.js").Image[]} textures
	 * @param {Boolean} generateMipmaps
	 * @throws {RangeError} if a texture is larger than `MAX_TEXTURE_SIZE`
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

			if (texture.viewport.magnitude() > WebGLRenderer.MAX_TEXTURE_SIZE.magnitude()) {
				throw new RangeError(`Could not load "${texture.name}": image dimensions are overflowing MAX_TEXTURE_SIZE.`);
			}

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

			this._textures[texture.name] = new TextureWrapper({
				image: texture.image,
				index: i,
				viewport: texture.viewport,
			});
		}
	}

	/**
	 * @abstract
	 * @param {Scene} scene
	 */
	render(scene) {}

	/**
	 * @param {Vector4} viewport
	 * @param {Matrix} projection
	 */
	resize(viewport, projection) {
		this.#viewport = viewport;
	}

	/**
	 * Warning: this clears the whole canvas; prefer targeting only specific parts when possible.
	 */
	clear() {
		this._context.clear(this._context.COLOR_BUFFER_BIT | this._context.DEPTH_BUFFER_BIT);
	}

	/**
	 * Frees all the resources used by the renderer
	 * and triggers a `webglcontextlost` event.
	 * 
	 * @see {@link https://registry.khronos.org/webgl/extensions/WEBGL_lose_context}
	 */
	dispose() {
		this._context.useProgram(null);
		this._context.bindBuffer(this._context.ARRAY_BUFFER, null);
		this._context.bindTexture(this._context.TEXTURE_2D_ARRAY, null);

		const buffers = Object.values(this._buffers);

		this._programs.length = 0;
		this._attributes = {};
		this._uniforms = {};
		this._buffers = {};
		this._textures = {};

		let i, length;

		for (i = 0, length = this._programs.length; i < length; i++) {
			this._context.deleteProgram(this._programs[i]);
		}

		for (i = 0, length = buffers.length; i < length; i++) {
			this._context.deleteBuffer(buffers[i]);
		}

		this._context.getExtension("WEBGL_lose_context").loseContext();
		this._context = null;
		this._canvas = null;
	}
}