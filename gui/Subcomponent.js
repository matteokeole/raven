import {Vector2, Vector4} from "../math/index.js";

/**
 * @typedef {Object} SubcomponentDescriptor
 * @property {Vector2} [offset]
 * @property {Vector2} size
 * @property {Vector2} [scale]
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
	#offset;

	/**
	 * @type {Vector2}
	 */
	#size;

	/**
	 * @type {Vector2}
	 */
	#scale;

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
	constructor(descriptor) {
		this.#offset = descriptor.offset ?? new Vector2();
		this.#size = descriptor.size;
		this.#scale = descriptor.scale ?? new Vector2(1, 1);
		this.#uv = descriptor.uv ?? new Vector2();
		this.#colorMask = descriptor.colorMask ?? new Vector4(255, 255, 255, 255);
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

	getSize() {
		return this.#size;
	}

	/**
	 * @param {Vector2} size
	 */
	setSize(size) {
		this.#size = size;
	}

	getScale() {
		return this.#scale;
	}

	/**
	 * @param {Vector2} scale
	 */
	setScale(scale) {
		this.#scale = scale;
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
			offset: this.#offset,
			size: this.#size,
			scale: this.#scale,
			uv: this.#uv,
			colorMask: this.#colorMask,
		});
	}
}