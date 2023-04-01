/**
 * Wrapper on a `WebGLTexture`.
 * 
 * @param {HTMLImageElement} image
 * @param {Number} index
 */
export function Texture(image, index) {
	/** @returns {HTMLImageElement} */
	this.getImage = () => image;

	/** @returns {Number} */
	this.getIndex = () => index;
}