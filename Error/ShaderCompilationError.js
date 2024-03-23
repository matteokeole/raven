export class ShaderCompilationError extends Error {
	/**
	 * @type {Record.<GLenum, String>}
	 */
	static #TYPES = {
		[WebGL2RenderingContext.VERTEX_SHADER]: "VERTEX",
		[WebGL2RenderingContext.FRAGMENT_SHADER]: "FRAGMENT",
	};

	/**
	 * @param {GLenum} type Shader type
	 * @param {String} log Shader info log
	 */
	constructor(type, log) {
		super(`${ShaderCompilationError.#TYPES[type]} SHADER COMPILATION ${log}`);
	}
}