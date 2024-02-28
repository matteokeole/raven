export class ShaderCompilationError extends Error {
	/**
	 * @param {String} message Shader info log
	 * @param {String} type Shader type
	 */
	constructor(message, type) {
		super(`${type} ${message}`);
	}
}