/**
 * @deprecated
 * 
 * Represents an error where a `WebGL2RenderingContext` could not be obtained
 * via an `HTMLCanvasElement` or `OffscreenCanvas`.
 */
export function NoWebGL2Error() {
	const
		instance = Error("It seems that your browser doesn't support WebGL2."),
		img = document.createElement("img");

	img.src = "assets/images/webgl.png";
	img.alt = '';

	instance.node = document.createElement("div");
	instance.node.classList.add("error");
	instance.node.append(img, instance.message);

	Object.setPrototypeOf(instance, this);

	return instance;
}

NoWebGL2Error.prototype = new Error;
NoWebGL2Error.prototype.name = "NoWebGL2Error";