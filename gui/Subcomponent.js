import {Vector2} from "../math/index.js";

/**
 * @param {{
 *    offset: Vector2,
 *    size: Vector2,
 *    uv: Vector2,
 * }}
 */
export function Subcomponent({offset, size, uv}) {
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
}

/** @returns {Subcomponent} */
Subcomponent.prototype.clone = function() {
	return new Subcomponent({
		offset: this.getOffset(),
		size: this.getSize(),
		uv: this.getUV(),
	});
}