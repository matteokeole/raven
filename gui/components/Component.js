import {Matrix3, Vector2} from "../../math/index.js";

/**
 * @param {{
 *    align: Number,
 *    margin: Vector2,
 *    size: Vector2,
 * }}
 */
export function Component({align, margin, size}) {
	/** @type {?Vector2} */
	let position;

	/**
	 * Computes the absolute position of the component
	 * by using its alignment and margin.
	 * 
	 * @param {Vector2} initial
	 * @param {Vector2} parentSize
	 */
	this.computePosition = function(initial, parentSize) {
		const
			m = margin,
			o = parentSize.subtract(size);

		if (align !== 0 && !align) throw TypeError(`Expecting an instance of Number, ${align} given`);

		switch (align) {
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

		switch (align) {
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

		position = initial.floor();
	};

	/** @returns {?Vector2} */
	this.getPosition = () => position;

	/** @param {Vector2} value */
	this.setPosition = value => void (position = value);

	/** @returns {Number} */
	this.getAlign = function() {
		if (typeof align !== "number") throw TypeError(`Expecting an instance of Number, ${align} given`);

		return align;
	};;

	/** @returns {Vector2} */
	this.getMargin = () => margin;

	/** @returns {Vector2} */
	this.getSize = () => size;

	/** @param {Vector2} value */
	this.setSize = value => void (size = value);

	/** @returns {Matrix3} */
	this.getWorldMatrix = () => Matrix3
		.translation(position)
		.multiply(Matrix3.scale(this.getSize()));
}

Component.alignLeftTop = 0;
Component.alignCenterTop = 1;
Component.alignRightTop = 2;
Component.alignLeftCenter = 3;
Component.alignCenter = 4;
Component.alignRightCenter = 5;
Component.alignLeftBottom = 6;
Component.alignCenterBottom = 7;
Component.alignRightBottom = 8;