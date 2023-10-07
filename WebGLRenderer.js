import {NoWebGL2Error, ShaderCompilationError} from "./errors/index.js";
import {Vector2} from "./math/index.js";
import {Program, Texture} from "./wrappers/index.js";

/**
 * General-purpose renderer based on a WebGL context.
 * 
 * @abstract
 * @param {Object} options
 * @param {Boolean} options.offscreen
 */
export function WebGLRenderer({offscreen}) {
	/** @type {HTMLCanvasElement|OffscreenCanvas|null} */
	let canvas;

	/** @type {WebGLRenderingContext|WebGL2RenderingContext|null} */
	let gl;

	/**
	 * @todo Switch to `Vector4`
	 * 
	 * @type {Vector2}
	 */
	const viewport = new Vector2();

	/**
	 * @private
	 * @type {WebGLProgram[]}
	 */
	const programs = [];

	/**
	 * @private
	 * @type {Object.<String, Number>}
	 */
	const attributes = {};

	/**
	 * @private
	 * @type {Object.<String, WebGLUniformLocation>}
	 */
	const uniforms = {};

	/**
	 * @private
	 * @type {Object.<String, WebGLBuffer>}
	 */
	const buffers = {};

	/**
	 * @private
	 * @type {Object.<String, WebGLTexture>}
	 */
	const textures = {};

	/**
	 * @private
	 * @type {Object.<String, Texture>}
	 */
	const userTextures = {};

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

	/** @returns {Object.<String, WebGLProgram>} */
	this.getPrograms = () => programs;

	/** @returns {Object.<String, Number>} */
	this.getAttributes = () => attributes;

	/** @returns {Object.<String, WebGLUniformLocation>} */
	this.getUniforms = () => uniforms;

	/** @returns {Object.<String, WebGLBuffer>} */
	this.getBuffers = () => buffers;

	/** @returns {Object.<String, WebGLTexture>} */
	this.getTextures = () => textures;

	/** @returns {Object.<String, Texture>} */
	this.getUserTextures = () => userTextures;

	/** @throws {NoWebGL2Error} */
	this.build = async function() {
		if (offscreen) {
			canvas = new OffscreenCanvas(0, 0);
		} else {
			canvas = document.createElement("canvas");
			canvas.textContent = "This browser does not support the Canvas API.";
		}

		gl = canvas.getContext("webgl2");

		if (gl === null) throw new NoWebGL2Error();
	};

	/** @see {@link https://registry.khronos.org/webgl/extensions/WEBGL_lose_context} */
	this.dispose = function() {
		let i, l;

		for (i = 0, l = programs.length; i < l; i++) gl.deleteProgram(programs[i]);
		programs.length = 0;

		for (i in attributes) delete attributes[i];

		for (i in uniforms) delete uniforms[i];

		for (i in buffers) {
			gl.deleteBuffer(buffers[i]);
			delete buffers[i];
		}

		for (i in textures) {
			gl.deleteTexture(textures[i]);
			delete textures[i];
		}

		for (i in userTextures) delete userTextures[i];

		gl.getExtension("WEBGL_lose_context").loseContext();
		gl = null;
		canvas = null;
	};
}

/**
 * @param {String} base
 * @param {String} vertexEndpoint
 * @param {String} fragmentEndpoint
 * @returns {Program}
 */
WebGLRenderer.prototype.loadProgram = async function(base, vertexEndpoint, fragmentEndpoint) {
	const
		gl = this.getContext(),
		program = gl.createProgram(),
		vertexShader = await createShader(gl, base, vertexEndpoint, gl.VERTEX_SHADER),
		fragmentShader = await createShader(gl, base, fragmentEndpoint, gl.FRAGMENT_SHADER);

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	this.getPrograms().push(program);

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
 * @todo Default texture for invalid paths?
 * 
 * Asynchronous texture loader.
 * Loads a list of sources in a `WebGLTexture` array.
 * 
 * @param {String[]} endpoints
 * @param {String} base
 * @throws {RangeError}
 * @throws {ReferenceError}
 */
WebGLRenderer.prototype.loadTextures = async function(endpoints, base) {
	const gl = this.getContext();

	if (gl.getParameter(gl.TEXTURE_BINDING_2D_ARRAY) === null) {
		throw ReferenceError("No texture array bound to the context");
	}

	const textures = this.getUserTextures();

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
			throw RangeError(`Could not load '${endpoint}': dimensions are overflowing MAX_TEXTURE_SIZE`);
		}

		gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, image.width, image.height, 1, gl.RGBA, gl.UNSIGNED_BYTE, image);

		textures[endpoint] = new Texture(image, i);
	}
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

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl
 * @param {String} base
 * @param {String} endpoint
 * @param {Number} type
 * @returns {WebGLShader}
 */
async function createShader(gl, base, endpoint, type) {
	const
		shader = gl.createShader(type),
		source = await (await fetch(`${base}${endpoint}`)).text();

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	return shader;
}