import {NoWebGL2Error, ShaderCompilationError} from "./errors/index.js";
import {Vector2} from "./math/index.js";
import {Program, Texture} from "./wrappers/index.js";

/** @type {Vector2} */
const MAX_TEXTURE_SIZE = new Vector2(256, 256);

/**
 * General-purpose renderer based on a WebGL context.
 * 
 * @param {{
 *    canvas: HTMLCanvasElement|OffscreenCanvas,
 *    generateMipmaps: Boolean,
 * }}
 * @throws {ReferenceError}
 * @throws {TypeError}
 */
export function WebGLRenderer({offscreen, generateMipmaps}) {
	if (typeof offscreen !== "boolean") throw TypeError(`The "offscreen" argument must be of type boolean, received ${typeof offscreen}`);
	if (typeof generateMipmaps !== "boolean") throw TypeError(`The "generateMipmaps" argument must be of type boolean, received ${typeof generateMipmaps}`);

	/** @type {HTMLCanvasElement|OffscreenCanvas} */
	let canvas;

	/** @type {WebGLRenderingContext|WebGL2RenderingContext} */
	let gl;

	/** @type {Object<String, Texture>} */
	const textures = {};

	/**
	 * @returns {HTMLCanvasElement|OffscreenCanvas}
	 * @throws {ReferenceError}
	 */
	this.getCanvas = function() {
		if (!(canvas instanceof HTMLCanvasElement || canvas instanceof OffscreenCanvas)) {
			throw ReferenceError("Attempt to get an undefined canvas");
		}

		return canvas;
	};

	/**
	 * @returns {WebGLRenderingContext|WebGL2RenderingContext}
	 * @throws {ReferenceError}
	 */
	this.getContext = function() {
		if (!(gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
			throw ReferenceError("Attempt to get an undefined WebGL context");
		}

		return gl;
	};

	/** @returns {Object<String, Texture>} */
	this.getTextures = () => textures;

	/** @throws {NoWebGL2Error} */
	this.build = function() {
		canvas = offscreen ? new OffscreenCanvas(0, 0) : document.createElement("canvas");
		gl = canvas.getContext("webgl2");

		if (gl === null) throw new NoWebGL2Error();
	};

	/**
	 * @todo Set viewport size as multiples of 2 to avoid subpixel artifacts? (This only concerns the current use of the lib)
	 * 
	 * @param {Vector2} viewport
	 * @returns {Vector2}
	 */
	this.setViewport = function(viewport) {
		gl.viewport(
			0,
			0,
			canvas.width = viewport.x,
			canvas.height = viewport.y,
		);

		return viewport;
	};

	/**
	 * @param {String} vertexPath
	 * @param {String} fragmentPath
	 * @param {String} basePath
	 * @returns {Program}
	 */
	this.loadProgram = async function(vertexPath, fragmentPath, basePath) {
		const
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
	};

	/**
	 * Links a loaded program to the WebGL context.
	 * Returns `true` if the linking was successful, `false` otherwise.
	 * 
	 * @param {Program} program
	 * @returns {Boolean}
	 * @throws {ShaderCompilationError}
	 */
	this.linkProgram = function(program) {
		gl.linkProgram(program.getProgram());

		if (gl.getProgramParameter(program.getProgram(), gl.LINK_STATUS)) return true;

		let log;

		if ((log = gl.getShaderInfoLog(program.getVertexShader())).length !== 0) {
			throw new ShaderCompilationError(log, "VERTEX SHADER");
		}

		if ((log = gl.getShaderInfoLog(program.getFragmentShader())).length !== 0) {
			throw new ShaderCompilationError(log, "FRAGMENT SHADER");
		}

		return false;
	};

	/**
	 * Binds a new texture array to the context.
	 * The texture size is capped by `MAX_TEXTURE_SIZE`.
	 * 
	 * @param {Number} length
	 */
	this.createTextureArray = function(length) {
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, gl.createTexture());
		gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 8, gl.RGBA8, MAX_TEXTURE_SIZE.x, MAX_TEXTURE_SIZE.y, length);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		generateMipmaps ?
			gl.generateMipmap(gl.TEXTURE_2D_ARRAY) :
			gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	};

	/**
	 * @todo Default texture for invalid paths?
	 * @todo Test with `gl.RGB` color format
	 * 
	 * Asynchronous texture loader.
	 * Loads a list of sources in a `WebGLTexture` array.
	 * Uses `gl.RGBA` color format.
	 * 
	 * @param {String[]} paths
	 * @param {String} basePath
	 * @throws {RangeError}
	 */
	this.loadTextures = async function(paths, basePath) {
		const {length} = paths;
		const image = new Image();
		let textureSize = new Vector2(0, 0);

		for (let i = 0, path; i < length; i++) {
			path = paths[i];
			image.src = `${basePath}${path}`;

			try {
				await image.decode();
			} catch (error) {
				continue;
			}

			textureSize.x = image.width;
			textureSize.y = image.height;

			if (textureSize.x > MAX_TEXTURE_SIZE.x || textureSize.y > MAX_TEXTURE_SIZE.y) {
				throw RangeError("Image size is greater than MAX_TEXTURE_SIZE");
			}

			gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, image.width, image.height, 1, gl.RGBA, gl.UNSIGNED_BYTE, image);

			textures[path] = new Texture(image, i);
		}
	};

	/**
	 * @todo Unbind and delete all linked objects (buffers, textures, etc)
	 * @todo Return value?
	 * @see {@link https://registry.khronos.org/webgl/extensions/WEBGL_lose_context}
	 */
	this.dispose = function() {
		// gl.deleteTexture(texture);
		// gl.deleteBuffer(buffer);
		// gl.deleteVertexArray(vao);
		// gl.deleteShader(shader);
		// gl.deleteProgram(program);
		gl.getExtension("WEBGL_lose_context").loseContext();

		gl = null;
		canvas.remove();
		canvas = null;
	};
}

/**
 * @abstract
 * @param {Array} scene
 * @param {Camera} camera
 */
WebGLRenderer.prototype.render;

WebGLRenderer.prototype.clear = function() {
	const gl = this.getContext();

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};