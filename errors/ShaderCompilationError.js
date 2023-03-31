/**
 * References an error when the binding of a `WebGLProgram` on a
 * `WebGLRenderingContext` fails due to a `WebGLShader` compilation error.
 * 
 * @extends Error
 * @param {String} message Shader info log
 * @param {Number} type Shader type (`gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`)
 */
export function ShaderCompilationError(message, type) {
	const instance = Error(`${shaderTypes[type]} SHADER ${message}`);

	instance.node = document.createElement("div");
	instance.node.classList.add("error");
	instance.node.append(instance.message);

	Object.setPrototypeOf(instance, this);

	return instance;
}

ShaderCompilationError.prototype = new Error;
ShaderCompilationError.prototype.name = "ShaderCompilationError";

const shaderTypes = {
	35632: "FRAGMENT",
	35633: "VERTEX",
};