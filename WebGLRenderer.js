import {NoWebGL2Error, ShaderCompilationError} from "./errors/index.js";
import {Vector2} from "./math/index.js";
import {Program, Texture} from "./wrappers/index.js";

/**
 * General-purpose renderer based on a WebGL context.
 * 
 * @param {Object} options
 * @param {Boolean} options.offscreen
 * @throws {ReferenceError}
 * @throws {TypeError}
 */
export function WebGLRenderer({offscreen}) {
	if (typeof offscreen !== "boolean") throw TypeError(`The "offscreen" argument must be of type boolean, received ${typeof offscreen}`);

	/** @type {HTMLCanvasElement|OffscreenCanvas} */
	let canvas;

	/** @type {WebGLRenderingContext|WebGL2RenderingContext} */
	let gl;

	/**
	 * @todo Switch to `Vector4`
	 * 
	 * @type {Vector2}
	 */
	const viewport = new Vector2(0, 0);

	/** @type {?Object.<String, Texture>} */
	let textures;

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

	/** @returns {?Object.<String, Texture>} */
	this.getTextures = () => textures;

	/** @param {?Object.<String, Texture>} value */
	this.setTextures = value => void (textures = value);

	/** @throws {NoWebGL2Error} */
	this.build = function() {
		canvas = offscreen ? new OffscreenCanvas(0, 0) : document.createElement("canvas");
		gl = canvas.getContext("webgl2");

		if (gl === null) throw new NoWebGL2Error();
	};

	/** @returns {Vector2} */
	this.getViewport = () => viewport;

	/** @param {Vector2} newViewport */
	this.setViewport = function(newViewport) {
		viewport.set(newViewport);

		gl.viewport(
			0,
			0,
			canvas.width = viewport[0],
			canvas.height = viewport[1],
		);
	};

	/**
	 * @todo Unbind and delete all linked objects
	 * 
	 * @see {@link https://registry.khronos.org/webgl/extensions/WEBGL_lose_context}
	 */
	this.dispose = function() {
		// gl.deleteTexture(texture);
		// gl.deleteBuffer(buffer);
		// gl.deleteShader(shader);
		// gl.deleteProgram(program);

		gl.getExtension("WEBGL_lose_context").loseContext();

		gl = null;
		canvas = null;
	};
}

/**
 * @param {String} vertexPath
 * @param {String} fragmentPath
 * @param {String} basePath
 * @returns {Program}
 */
WebGLRenderer.prototype.loadProgram = async function(vertexPath, fragmentPath, basePath) {
	const
		gl = this.getContext(),
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
WebGLRenderer.prototype.linkProgram = function(program) {
	const gl = this.getContext();

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
 * The texture size is capped by `WebGLRenderer.MAX_TEXTURE_SIZE`.
 * 
 * @param {Number} length
 * @param {Boolean} [generateMipmaps=false]
 */
WebGLRenderer.prototype.createTextureArray = function(length, generateMipmaps = false) {
	const gl = this.getContext();

	gl.bindTexture(gl.TEXTURE_2D_ARRAY, gl.createTexture());
	gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	generateMipmaps ?
		gl.generateMipmap(gl.TEXTURE_2D_ARRAY) :
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, WebGLRenderer.MAX_TEXTURE_SIZE[0], WebGLRenderer.MAX_TEXTURE_SIZE[1], length);
};

/**
 * @todo Default texture for invalid paths?
 * 
 * Asynchronous texture loader.
 * Loads a list of sources in a `WebGLTexture` array.
 * 
 * @param {String[]} paths
 * @param {String} basePath
 * @throws {RangeError}
 * @throws {ReferenceError}
 */
WebGLRenderer.prototype.loadTextures = async function(paths, basePath) {
	const gl = this.getContext();

	if (gl.getParameter(gl.TEXTURE_BINDING_2D_ARRAY) === null) {
		throw ReferenceError("No texture array bound to the context");
	}

	/** @type {Object.<String, Texture>} */
	const textures = {};

	for (let i = 0, l = paths.length, path, image; i < l; i++) {
		path = paths[i];
		image = new Image();
		image.src = `${basePath}${path}`;

		try {
			await image.decode();
		} catch (error) {
			continue;
		}

		if (image.width > WebGLRenderer.MAX_TEXTURE_SIZE[0] || image.height > WebGLRenderer.MAX_TEXTURE_SIZE[1]) {
			throw RangeError(`Could not load '${path}': dimensions are overflowing MAX_TEXTURE_SIZE`);
		}

		gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, image.width, image.height, 1, gl.RGBA, gl.UNSIGNED_BYTE, image);

		textures[path] = new Texture(image, i);
	}

	this.setTextures(textures);
};

/**
 * @abstract
 * @param {Array} scene
 */
WebGLRenderer.prototype.render;

WebGLRenderer.prototype.clear = function() {
	const gl = this.getContext();

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

/**
 * @todo Rework
 * 
 * @type {Vector2}
 */
WebGLRenderer.MAX_TEXTURE_SIZE = new Vector2(256, 256);