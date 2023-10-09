import {Matrix3, Vector2} from "../../math/index.js";

/**
 * @abstract
 */
export class Component {
	/**
	 * @type {Number}
	 */
	static alignLeftTop = 0;

	/**
	 * @type {Number}
	 */
	static alignCenterTop = 1;

	/**
	 * @type {Number}
	 */
	static alignRightTop = 2;

	/**
	 * @type {Number}
	 */
	static alignLeftCenter = 3;

	/**
	 * @type {Number}
	 */
	static alignCenter = 4;

	/**
	 * @type {Number}
	 */
	static alignRightCenter = 5;

	/**
	 * @type {Number}
	 */
	static alignLeftBottom = 6;

	/**
	 * @type {Number}
	 */
	static alignCenterBottom = 7;

	/**
	 * @type {Number}
	 */
	static alignRightBottom = 8;

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
			case Component.alignLeftTop:
			case Component.alignLeftCenter:
			case Component.alignLeftBottom:
				initial[0] += m[0];

				break;
			case Component.alignCenterTop:
			case Component.alignCenter:
			case Component.alignCenterBottom:
				initial[0] += o[0] * .5 + m[0];

				break;
			case Component.alignRightTop:
			case Component.alignRightCenter:
			case Component.alignRightBottom:
				initial[0] += o[0] - m[0];

				break;
		}

		switch (this.#alignment) {
			case Component.alignLeftTop:
			case Component.alignCenterTop:
			case Component.alignRightTop:
				initial[1] += m[1];

				break;
			case Component.alignLeftCenter:
			case Component.alignCenter:
			case Component.alignRightCenter:
				initial[1] += o[1] * .5 + m[1];

				break;
			case Component.alignLeftBottom:
			case Component.alignCenterBottom:
			case Component.alignRightBottom:
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