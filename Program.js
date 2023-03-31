/**
 * Wrapper on a `WebGLProgram`.
 * 
 * @param {WebGLProgram} program
 * @param {WebGLShader} vertexShader
 * @param {WebGLShader} fragmentShader
 */
export function Program(program, vertexShader, fragmentShader) {
	/** @returns {WebGLProgram} */
	this.getProgram = () => program;

	/** @returns {WebGLShader} */
	this.getVertexShader = () => vertexShader;

	/** @returns {WebGLShader} */
	this.getFragmentShader = () => fragmentShader;
}