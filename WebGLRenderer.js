import {NoWebGL2Error, ShaderCompilationError} from "./errors/index.js";
import {Vector2} from "./math/index.js";
import {Program, Texture} from "./wrappers/index.js";

/**
 * General-purpose renderer based on a WebGL context.
 * 
 * @abstract
 */
export class WebGLRenderer {
	/**
	 * @type {Vector2}
	 */
	static MAX_TEXTURE_SIZE = new Vector2(256, 256);

	/**
	 * @type {Boolean}
	 */
	#offscreen;

	/**
	 * @type {null|HTMLCanvasElement|OffscreenCanvas}
	 */
	#canvas;

	/**
	 * @type {?WebGL2RenderingContext}
	 */
	#context;

	/**
	 * @todo Switch to `Vector4`
	 * 
	 * @type {Vector2}
	 */
	#viewport;

	/**
	 * @type {WebGLProgram[]}
	 */
	#programs;

	/**
	 * @type {Object.<String, Number>}
	 */
	#attributes;

	/**
	 * @type {Object.<String, WebGLUniformLocation>}
	 */
	#uniforms;

	/**
	 * @type {Object.<String, WebGLBuffer>}
	 */
	#buffers;

	/**
	 * @type {Object.<String, WebGLTexture>}
	 */
	#textures;

	/**
	 * @type {Object.<String, Texture>}
	 */
	#userTextures;

	/**
	 * @param {Object} options
	 * @param {Boolean} options.offscreen
	 */
	constructor({offscreen}) {
		this.#offscreen = offscreen;
		this.#canvas = null;
		this.#context = null;
		this.#viewport = new Vector2();
		this.#programs = [];
		this.#attributes = {};
		this.#uniforms = {};
		this.#buffers = {};
		this.#textures = {};
		this.#userTextures = {};
	}

	/**
	 * @returns {null|HTMLCanvasElement|OffscreenCanvas}
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
	 * @returns {Vector2}
	 */
	getViewport() {
		return this.#viewport;
	}

	/**
	 * @param {Vector2} viewport
	 */
	setViewport(viewport) {
		this.#viewport = viewport;
		this.#canvas.width = this.#viewport[0];
		this.#canvas.height = this.#viewport[1];

		this.#context.viewport(
			0,
			0,
			this.#viewport[0],
			this.#viewport[1],
		);
	}

	/**
	 * @returns {Object.<String, WebGLProgram>}
	 */
	getPrograms() {
		return this.#programs;
	}

	/**
	 * @returns {Object.<String, Number>}
	 */
	getAttributes() {
		return this.#attributes;
	}

	/**
	 * @returns {Object.<String, WebGLUniformLocation>}
	 */
	getUniforms() {
		return this.#uniforms;
	}

	/**
	 * @returns {Object.<String, WebGLBuffer>}
	 */
	getBuffers() {
		return this.#buffers;
	}

	/**
	 * @returns {Object.<String, WebGLTexture>}
	 */
	getTextures() {
		return this.#textures;
	}

	/**
	 * @returns {Object.<String, Texture>}
	 */
	getUserTextures() {
		return this.#userTextures;
	}

	/**
	 * @throws {NoWebGL2Error}
	 */
	async build() {
		if (this.#offscreen) {
			this.#canvas = new OffscreenCanvas(0, 0);
		} else {
			this.#canvas = document.createElement("canvas");
			this.#canvas.textContent = "This browser does not support the Canvas API.";
		}

		this.#context = this.#canvas.getContext("webgl2");

		if (this.#context === null) {
			throw new NoWebGL2Error();
		}
	}

	/**
	 * @param {String} base
	 * @param {String} vertexEndpoint
	 * @param {String} fragmentEndpoint
	 * @returns {Promise<Program>}
	 */
	async loadProgram(base, vertexEndpoint, fragmentEndpoint) {
		const program = this.#context.createProgram();
		const vertexShader = await this.#createShader(base, vertexEndpoint, this.#context.VERTEX_SHADER);
		const fragmentShader = await this.#createShader(base, fragmentEndpoint, this.#context.FRAGMENT_SHADER);

		this.#context.attachShader(program, vertexShader);
		this.#context.attachShader(program, fragmentShader);

		this.getPrograms().push(program);

		return new Program(program, vertexShader, fragmentShader);
	}

	/**
	 * Links a loaded program to the renderer context.
	 * Returns `true` if the linking was successful and a `ShaderCompilationError` otherwise.
	 * 
	 * @param {Program} program
	 * @returns {Boolean}
	 * @throws {ShaderCompilationError}
	 */
	linkProgram(program) {
		this.#context.linkProgram(program.getProgram());

		if (this.#context.getProgramParameter(program.getProgram(), this.#context.LINK_STATUS)) {
			return true;
		}

		/**
		 * @type {?String}
		 */
		let log;

		if ((log = this.#context.getShaderInfoLog(program.getVertexShader())).length !== 0) {
			throw new ShaderCompilationError(log, "VERTEX SHADER");
		}

		if ((log = this.#context.getShaderInfoLog(program.getFragmentShader())).length !== 0) {
			throw new ShaderCompilationError(log, "FRAGMENT SHADER");
		}
	}

	/**
	 * Binds a new texture array to the context.
	 * The texture size is capped by `WebGLRenderer.MAX_TEXTURE_SIZE`.
	 * 
	 * @param {Number} length
	 * @param {Boolean} [generateMipmaps]
	 */
	createTextureArray(length, generateMipmaps) {
		this.#context.bindTexture(this.#context.TEXTURE_2D_ARRAY, this.#context.createTexture());
		this.#context.texParameteri(this.#context.TEXTURE_2D_ARRAY, this.#context.TEXTURE_MAG_FILTER, this.#context.NEAREST);

		if (generateMipmaps) {
			this.#context.generateMipmap(this.#context.TEXTURE_2D_ARRAY);
		} else {
			this.#context.texParameteri(this.#context.TEXTURE_2D_ARRAY, this.#context.TEXTURE_MIN_FILTER, this.#context.LINEAR);
		}

		this.#context.texStorage3D(this.#context.TEXTURE_2D_ARRAY, 1, this.#context.RGBA8, WebGLRenderer.MAX_TEXTURE_SIZE[0], WebGLRenderer.MAX_TEXTURE_SIZE[1], length);
	}

	/**
	 * Loads a list of colors into a WebGLTexture array.
	 * 
	 * @param {Object.<String, String>} colors
	 * @throws {ReferenceError} if no texture array is bound to the context
	 */
	loadColors(colors) {
		if (this.#context.getParameter(this.#context.TEXTURE_BINDING_2D_ARRAY) === null) {
			throw ReferenceError("No texture array bound to the context");
		}

		const textureCount = Object.keys(this.#userTextures).length;
		const canvas = new OffscreenCanvas(WebGLRenderer.MAX_TEXTURE_SIZE[0], WebGLRenderer.MAX_TEXTURE_SIZE[1]);
		const ctx = canvas.getContext("2d");

		colors = Object.entries(colors);

		for (let i = 0, l = colors.length; i < l; i++) {
			ctx.clearRect(0, 0, WebGLRenderer.MAX_TEXTURE_SIZE[0], WebGLRenderer.MAX_TEXTURE_SIZE[1]);
			ctx.fillStyle = colors[i][1];
			ctx.fillRect(0, 0, WebGLRenderer.MAX_TEXTURE_SIZE[0], WebGLRenderer.MAX_TEXTURE_SIZE[1]);

			this.#context.texSubImage3D(
				this.#context.TEXTURE_2D_ARRAY,
				0,
				0,
				0,
				textureCount + i,
				WebGLRenderer.MAX_TEXTURE_SIZE[0],
				WebGLRenderer.MAX_TEXTURE_SIZE[1],
				1,
				this.#context.RGBA,
				this.#context.UNSIGNED_BYTE,
				canvas,
			);

			this.#userTextures[colors[i][0]] = new Texture(
				new Image(WebGLRenderer.MAX_TEXTURE_SIZE[0], WebGLRenderer.MAX_TEXTURE_SIZE[1]),
				textureCount + i,
			);
		}
	}

	/**
	 * @todo Specify default texture for invalid paths?
	 * 
	 * Loads asynchronously a list of image endpoints in a WebGLTexture array.
	 * 
	 * @param {String[]} endpoints
	 * @param {String} base
	 * @throws {RangeError} if the image dimensions are larger than `WebGLRenderer.MAX_TEXTURE_SIZE`
	 * @throws {ReferenceError} if no texture array is bound to the context
	 */
	async loadTextures(endpoints, base) {
		if (this.#context.getParameter(this.#context.TEXTURE_BINDING_2D_ARRAY) === null) {
			throw ReferenceError("No texture array bound to the context");
		}

		const textureCount = Object.keys(this.#userTextures).length;

		for (let i = 0, l = endpoints.length, endpoint, image; i < l; i++) {
			endpoint = endpoints[i];
			image = new Image();
			image.src = `${base}${endpoint}`;

			try {
				await image.decode();
			} catch (error) {
				continue;
			}

			if (image.width > WebGLRenderer.MAX_TEXTURE_SIZE[0] || image.height > WebGLRenderer.MAX_TEXTURE_SIZE[1]) {
				throw new RangeError(`Could not load "${endpoint}": image dimensions are overflowing MAX_TEXTURE_SIZE.`);
			}

			this.#context.texSubImage3D(
				this.#context.TEXTURE_2D_ARRAY,
				0,
				0,
				0,
				textureCount + i,
				image.width,
				image.height,
				1,
				this.#context.RGBA,
				this.#context.UNSIGNED_BYTE,
				image,
			);

			this.#userTextures[endpoint] = new Texture(image, textureCount + i);
		}
	}

	/**
	 * @abstract
	 * @param {Array} scene
	 */
	render(scene) {}

	/**
	 * Warning: do not call this every frame to avoid unnecessary operations.
	 */
	clear() {
		this.#context.clear(this.#context.COLOR_BUFFER_BIT | this.#context.DEPTH_BUFFER_BIT);
	}

	/**
	 * @see {@link https://registry.khronos.org/webgl/extensions/WEBGL_lose_context}
	 */
	dispose() {
		let i, l;

		for (i = 0, l = this.#programs.length; i < l; i++) {
			this.#context.deleteProgram(this.#programs[i]);
		}

		this.#programs.length = 0;

		for (i in this.#attributes) {
			delete this.#attributes[i];
		}

		for (i in this.#uniforms) {
			delete this.#uniforms[i];
		}

		for (i in this.#buffers) {
			this.#context.deleteBuffer(this.#buffers[i]);

			delete this.#buffers[i];
		}

		for (i in this.#textures) {
			this.#context.deleteTexture(this.#textures[i]);

			delete this.#textures[i];
		}

		for (i in this.#userTextures) {
			delete this.#userTextures[i];
		}

		this.#context.getExtension("WEBGL_lose_context").loseContext();
		this.#context = null;
		this.#canvas = null;
	}

	/**
	 * @param {String} base
	 * @param {String} endpoint
	 * @param {GLint} type `gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`
	 * @returns {Promise<WebGLShader>}
	 */
	async #createShader(base, endpoint, type) {
		const shader = this.#context.createShader(type);
		const source = await (await fetch(`${base}${endpoint}`)).text();

		this.#context.shaderSource(shader, source);
		this.#context.compileShader(shader);

		return shader;
	}
}