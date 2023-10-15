export class Program {
	/**
	 * @type {WebGLProgram}
	 */
	#program;

	/**
	 * @type {WebGLShader}
	 */
	#vertexShader;

	/**
	 * @type {WebGLShader}
	 */
	#fragmentShader;

	/**
	 * @param {WebGLProgram} program
	 * @param {WebGLShader} vertexShader
	 * @param {WebGLShader} fragmentShader
	 */
	constructor(program, vertexShader, fragmentShader) {
		this.#program = program;
		this.#vertexShader = vertexShader;
		this.#fragmentShader = fragmentShader;
	}

	/**
	 * @returns {WebGLProgram}
	 */
	getProgram() {
		return this.#program;
	}

	/**
	 * @returns {WebGLShader}
	 */
	getVertexShader() {
		return this.#vertexShader;
	}

	/**
	 * @returns {WebGLShader}
	 */
	getFragmentShader() {
		return this.#fragmentShader;
	}
}