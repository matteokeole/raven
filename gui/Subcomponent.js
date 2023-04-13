import {Vector2, Vector4} from "../math/index.js";

/**
 * @todo See `gl.colorMask`
 * @todo Remove Vector.clone calls if useless
 * 
 * @param {Object} options
 * @param {Vector2} options.offset
 * @param {Vector2} options.size
 * @param {Vector2} options.uv
 * @param {Vector4} [options.colorMask]
 */
export function Subcomponent({offset, size, uv, colorMask}) {
	colorMask ??= new Vector4();

	/** @returns {Vector2} */
	this.getOffset = () => offset;

	/** @param {Vector2} value */
	this.setOffset = value => void (offset = value);

	/** @returns {Vector2} */
	this.getSize = () => size;

	/** @returns {Vector2} */
	this.getUV = () => uv;

	/** @param {Vector2} value */
	this.setUV = value => void (uv = value);

	/** @returns {Vector4} */
	this.getColorMask = () => colorMask;

	/** @param {Vector4} value */
	this.setColorMask = value => void (colorMask = value);
}

/** @returns {Subcomponent} */
Subcomponent.prototype.clone = function() {
	return new Subcomponent({
		offset: this.getOffset().clone(),
		size: this.getSize().clone(),
		uv: this.getUV().clone(),
		colorMask: this.getColorMask().clone(),
	});
}