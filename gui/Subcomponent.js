import {Vector2, Vector4} from "../math/index.js";

/**
 * @todo See gl.colorMask
 */
export class Subcomponent {
	/** @param {Vector2} */
	#size;

	/** @param {Vector2} */
	#offset;

	/** @param {Vector2} */
	#uv;

	/** @param {Vector4} */
	#colorMask;

	/**
	 * @param {Object} options
	 * @param {Vector2} options.size
	 * @param {Vector2} options.offset
	 * @param {Vector2} options.uv
	 * @param {Vector4} [options.colorMask]
	 */
	constructor({size, offset, uv, colorMask = new Vector4(255, 255, 255, 255)}) {
		this.#size = size;
		this.#offset = offset;
		this.#uv = uv;
		this.#colorMask = colorMask;
	}

	/** @returns {Vector2} */
	getSize() {
		return this.#size;
	}

	/** @param {Vector2} size */
	setSize(size) {
		this.#size = size;
	}

	/** @returns {Vector2} */
	getOffset() {
		return this.#offset;
	}

	/** @param {Vector2} offset */
	setOffset(offset) {
		this.#offset = offset;
	}

	/** @returns {Vector2} */
	getUV() {
		return this.#uv;
	}

	/** @param {Vector2} uv */
	setUV(uv) {
		this.#uv = uv;
	}

	/** @returns {Vector4} */
	getColorMask() {
		return this.#colorMask;
	}

	/** @param {Vector4} colorMask */
	setColorMask(colorMask) {
		this.#colorMask = colorMask;
	}

	/** @returns {Subcomponent} */
	clone() {
		return new Subcomponent({
			size: this.#size,
			offset: this.#offset,
			uv: this.#uv,
			colorMask: this.#colorMask,
		});
	}
}