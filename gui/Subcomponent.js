import {Vector2, Vector3} from "../math/index.js";

/**
 * @todo Convert `colorMask` to a `Vector4`, with the alpha value being the weight in the mix
 * 
 * @param {Object} options
 * @param {Vector2} options.offset
 * @param {Vector2} options.size
 * @param {Vector2} options.uv
 * @param {Vector3} [options.colorMask=new Vector3(0, 0, 0)]
 * @param {Number} [options.colorMaskWeight=0]
 */
export function Subcomponent({offset, size, uv, colorMask = new Vector3(0, 0, 0), colorMaskWeight = 0}) {
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

	/** @returns {Vector3} */
	this.getColorMask = () => colorMask;

	/** @param {Vector3} value */
	this.setColorMask = value => void (colorMask = value);

	/** @returns {Number} */
	this.getColorMaskWeight = () => colorMaskWeight;

	/** @param {Number} value */
	this.setColorMaskWeight = value => void (colorMaskWeight = value);
}

/** @returns {Subcomponent} */
Subcomponent.prototype.clone = function() {
	return new Subcomponent({
		offset: this.getOffset(),
		size: this.getSize(),
		uv: this.getUV(),
		colorMask: this.getColorMask(),
		colorMaskWeight: this.getColorMaskWeight(),
	});
}