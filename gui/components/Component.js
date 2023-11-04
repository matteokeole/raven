import {Alignment} from "../index.js";
import {Matrix3, Vector2} from "../../math/index.js";

/**
 * @abstract
 */
export class Component {
	/**
	 * @type {?Vector2}
	 */
	#position;

	/**
	 * @type {Number}
	 */
	#alignment;

	/**
	 * @type {Vector2}
	 */
	#margin;

	/**
	 * @type {Vector2}
	 */
	#size;

	/**
	 * @param {Object} options
	 * @param {Number} options.alignment
	 * @param {Vector2} [options.margin]
	 * @param {Vector2} options.size
	 */
	constructor({alignment, margin = new Vector2(), size}) {
		this.#position = null;
		this.#alignment = alignment;
		this.#margin = margin;
		this.#size = size;
	}

	/**
	 * @returns {?Vector2}
	 */
	getPosition() {
		return this.#position;
	}

	/**
	 * @param {?Vector2} position
	 */
	setPosition(position) {
		this.#position = position;
	}

	/**
	 * @returns {Number}
	 */
	getAlignment() {
		return this.#alignment;
	}

	/**
	 * @returns {Vector2}
	 */
	getMargin() {
		return this.#margin;
	}

	/**
	 * @returns {Vector2}
	 */
	getSize() {
		return this.#size;
	}

	/**
	 * @param {Vector2} size
	 */
	setSize(size) {
		this.#size = size;
	}

	/**
	 * Calculates the component absolute position.
	 * 
	 * @param {Vector2} initial Cloned parent top left corner
	 * @param {Vector2} parentSize Cloned parent size
	 */
	compute(initial, parentSize) {
		const x = ((this.#alignment & 0b111000) >> 4) * .5;
		const y = ((this.#alignment & 0b111) >> 1) * .5;

		const displacement = parentSize
			.subtract(this.#size)
			.multiply(new Vector2(x, y));
		const marginDisplacement = new Vector2(x & 1, y & 1)
			.multiplyScalar(-2)
			.addScalar(1);
		const margin = this.#margin
			.clone()
			.multiply(marginDisplacement);

		this.#position = initial
			.add(displacement)
			.add(margin)
			.floor();
	}

	/**
	 * @returns {Matrix3}
	 */
	getWorld() {
		return Matrix3
			.translation(this.#position)
			.multiply(Matrix3.scale(this.#size));
	}
}