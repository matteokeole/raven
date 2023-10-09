import {Alignment} from "../index.js";
import {Matrix3, Vector2} from "../../math/index.js";

/**
 * @typedef {Number} Alignment
 */

/**
 * @abstract
 */
export class Component {
	/**
	 * @type {?Vector2}
	 */
	#position;

	/**
	 * @type {Alignment}
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
	 * @param {Alignment} options.alignment
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
	 * @returns {Alignment}
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
	 * Computes the absolute position of the component
	 * by using its alignment and margin.
	 * 
	 * @param {Vector2} initial
	 * @param {Vector2} parentSize
	 */
	compute(initial, parentSize) {
		const m = this.#margin;
		const o = parentSize.subtract(this.#size);

		switch (this.#alignment) {
			case Alignment.topLeft:
			case Alignment.centerLeft:
			case Alignment.bottomLeft:
				initial[0] += m[0];

				break;
			case Alignment.topCenter:
			case Alignment.center:
			case Alignment.bottomCenter:
				initial[0] += o[0] * .5 + m[0];

				break;
			case Alignment.topRight:
			case Alignment.centerRight:
			case Alignment.bottomRight:
				initial[0] += o[0] - m[0];

				break;
		}

		switch (this.#alignment) {
			case Alignment.topLeft:
			case Alignment.topCenter:
			case Alignment.topRight:
				initial[1] += m[1];

				break;
			case Alignment.centerLeft:
			case Alignment.center:
			case Alignment.centerRight:
				initial[1] += o[1] * .5 + m[1];

				break;
			case Alignment.bottomLeft:
			case Alignment.bottomCenter:
			case Alignment.bottomRight:
				initial[1] += o[1] - m[1];

				break;
		}

		this.#position = initial.floor();
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