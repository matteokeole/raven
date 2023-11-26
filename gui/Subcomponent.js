import {Vector2, Vector4} from "../math/index.js";

/**
 * @typedef {Object} SubcomponentDescriptor
 * @property {Vector2} size
 * @property {Vector2} [offset]
 * @property {Vector2} [uv]
 * @property {Vector4} [colorMask]
 */

/**
 * @todo See gl.colorMask
 */
export class Subcomponent {
	/**
	 * @type {Vector2}
	 */
	#size;

	/**
	 * @type {Vector2}
	 */
	#offset;

	/**
	 * @type {Vector2}
	 */
	#uv;

	/**
	 * @type {Vector4}
	 */
	#colorMask;

	/**
	 * @param {SubcomponentDescriptor} descriptor
	 */
	constructor({size, offset = new Vector2(), uv = new Vector2(), colorMask = new Vector4(255, 255, 255, 255)}) {
		this.#size = size;
		this.#offset = offset;
		this.#uv = uv;
		this.#colorMask = colorMask;
	}

	getSize() {
		return this.#size;
	}

	/**
	 * @param {Vector2} size
	 */
	setSize(size) {
		this.#size = size;
	}

	getOffset() {
		return this.#offset;
	}

	/**
	 * @param {Vector2} offset
	 */
	setOffset(offset) {
		this.#offset = offset;
	}

	getUV() {
		return this.#uv;
	}

	/**
	 * @param {Vector2} uv
	 */
	setUV(uv) {
		this.#uv = uv;
	}

	getColorMask() {
		return this.#colorMask;
	}

	/**
	 * @param {Vector4} colorMask
	 */
	setColorMask(colorMask) {
		this.#colorMask = colorMask;
	}

	clone() {
		return new Subcomponent({
			size: this.#size,
			offset: this.#offset,
			uv: this.#uv,
			colorMask: this.#colorMask,
		});
	}
}