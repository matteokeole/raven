/**
 * References an error when the binding of a `WebGLProgram` on a
 * `WebGLRenderingContext` fails due to a `WebGLShader` compilation error.
 * 
 * @param {String} message Error log
 * @param {String} type Shader type
 */
export function ShaderCompilationError(message, type) {
	const instance = Error(`${type} ${message}`);

	instance.node = document.createElement("div");
	instance.node.classList.add("error");
	instance.node.append(instance.message);

	Object.setPrototypeOf(instance, this);

	return instance;
}

ShaderCompilationError.prototype = new Error;
ShaderCompilationError.prototype.name = "ShaderCompilationError";