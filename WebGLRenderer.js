import {NotImplementedError, NoWebGL2Error, ShaderCompilationError} from "./errors/index.js";
import {Vector2} from "./math/index.js";
import {Program} from "./Program.js";
import Texture from "./Texture.js";

/** @type {Vector2} */
const MAX_TEXTURE_SIZE = new Vector2(256, 256);

/**
 * @todo Convert to function constructor
 * 
 * General-purpose renderer based on a WebGL context.
 */
export default class WebGLRenderer {
	/** @type {Boolean} */
	#offscreen;

	/** @type {Boolean} */
	#generateMipmaps;

	/** @type {Number} */
	#version;

	/**
	 * @param {{
	 *    offscreen: Boolean,
	 *    generateMipmaps: Boolean,
	 *    version: Number,
	 * }}
	 */
	constructor({offscreen, generateMipmaps, version}) {
		if (typeof offscreen !== "boolean") throw TypeError(`The "offscreen" argument must be of type boolean, received ${typeof offscreen}`);
		if (typeof generateMipmaps !== "boolean") throw TypeError(`The "generateMipmaps" argument must be of type boolean, received ${typeof generateMipmaps}`);
		if (version !== 1 && version !== 2) throw TypeError(`Unrecognized WebGL version: ${version}`);

		this.#offscreen = offscreen;
		this.#generateMipmaps = generateMipmaps;
		this.#version = version;

		/**
		 * @public
		 * @type {HTMLCanvasElement|OffscreenCanvas|null}
		 */
		this.canvas = null;

		/**
		 * @public
		 * @type {WebGLRenderingContext|WebGL2RenderingContext|null}
		 */
		this.gl = null;

		/**
		 * @public
		 * @type {Object<String, Texture>}
		 */
		this.textures = {};
	}

	build() {
		this.canvas = this.#offscreen ? new OffscreenCanvas(0, 0) : document.createElement("canvas");
		this.gl = this.canvas.getContext(this.#version === 2 ? "webgl2" : "webgl");

		if (this.gl === null) throw new NoWebGL2Error();
	}

	/**
	 * @todo Set viewport size as multiples of 2 to avoid subpixel artifacts? (This only concerns the current use of the lib)
	 * 
	 * @param {Vector2} viewport
	 * @returns {Vector2}
	 */
	setViewport(viewport) {
		this.gl.viewport(
			0,
			0,
			this.canvas.width = viewport.x,
			this.canvas.height = viewport.y,
		);

		return viewport;
	}

	async loadProgram(vertexPath, fragmentPath, basePath) {
		const
			{gl} = this,
			createShader = async function(path, type) {
				const
					shader = gl.createShader(type),
					source = await (await fetch(path)).text();

				gl.shaderSource(shader, source);
				gl.compileShader(shader);

				return shader;
			},
			program = gl.createProgram(),
			vertexShader = await createShader(`${basePath}${vertexPath}`, gl.VERTEX_SHADER),
			fragmentShader = await createShader(`${basePath}${fragmentPath}`, gl.FRAGMENT_SHADER);

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);

		return new Program(program, vertexShader, fragmentShader);
	}

	/**
	 * Links a loaded program to the WebGL context.
	 * Returns `true` if the linking was successful, `false` otherwise.
	 * 
	 * @param {Program} program
	 * @returns {Boolean}
	 * @throws {ShaderCompilationError}
	 */
	linkProgram(program) {
		const {gl} = this;

		gl.linkProgram(program.getProgram());

		if (gl.getProgramParameter(program.getProgram(), gl.LINK_STATUS)) return true;

		let log;

		if ((log = gl.getShaderInfoLog(program.getVertexShader())).length !== 0) {
			throw new ShaderCompilationError(log, gl.VERTEX_SHADER);
		}

		if ((log = gl.getShaderInfoLog(program.getFragmentShader())).length !== 0) {
			throw new ShaderCompilationError(log, gl.FRAGMENT_SHADER);
		}

		return false;
	}

	/**
	 * Initializes a new texture array for this renderer.
	 * The maximum texture size is 256x256.
	 * 
	 * @param {Number} length
	 */
	createTextureArray(length) {
		const {gl} = this;
		const generateMipmaps = this.#generateMipmaps;

		gl.bindTexture(gl.TEXTURE_2D_ARRAY, gl.createTexture());
		gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 8, gl.RGBA8, MAX_TEXTURE_SIZE.x, MAX_TEXTURE_SIZE.y, length);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		generateMipmaps ?
			gl.generateMipmap(gl.TEXTURE_2D_ARRAY) :
			gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}

	/**
	 * @todo Test with `gl.RGB` color format
	 * 
	 * Asynchronous texture loader.
	 * Loads a list of sources in a `WebGLTexture` array.
	 * Uses `gl.RGBA` color format.
	 * 
	 * @param {String[]} paths
	 * @param {String} basePath
	 */
	async loadTextures(paths, basePath) {
		const {gl} = this;
		const {length} = paths;
		const image = new Image();

		for (let i = 0, path; i < length; i++) {
			path = paths[i];
			image.src = `${basePath}${path}`;

			try {
				await image.decode();
			} catch (error) {
				/** @todo Default texture for invalid paths? */
				continue;
			}

			gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, image.width, image.height, 1, gl.RGBA, gl.UNSIGNED_BYTE, image);

			this.textures[path] = new Texture(image, i);
		}
	}

	/**
	 * Renders a frame.
	 * 
	 * @param {Array} scene
	 * @param {Camera} camera
	 */
	render(scene, camera) {
		throw new NotImplementedError();
	}

	clear() {
		const {gl} = this;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	/**
	 * @todo Unbind and delete all linked objects (buffers, textures, etc)
	 * @see {@link https://registry.khronos.org/webgl/extensions/WEBGL_lose_context}
	 */
	dispose() {
		// this.gl.deleteTexture(texture);
		// this.gl.deleteBuffer(buffer);
		// this.gl.deleteVertexArray(vao);
		// this.gl.deleteShader(shader);
		// this.gl.deleteProgram(program);
		this.gl.getExtension("WEBGL_lose_context").loseContext();

		this.gl = null;
		this.canvas.remove();
		this.canvas = null;
	}
}