import {Component} from "./Component.js";

/**
 * @abstract
 */
export class StructuralComponent extends Component {
	/**
	 * @type {Component[]}
	 */
	#children;

	/**
	 * @param {Object} options
	 * @param {Component[]} options.children
	 */
	constructor({children}) {
		super(arguments[0]);

		this.#children = children;
	}

	/**
	 * @returns {Component[]}
	 */
	getChildren() {
		return this.#children;
	}

	/**
	 * @inheritdoc
	 */
	compute(initial, parentSize) {
		const alignment = this.getAlignment();
		const size = this.getSize();
		const m = this.getMargin();
		const o = parentSize.subtract(size);

		switch (alignment) {
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

		switch (alignment) {
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

		initial = initial.floor();

		this.setPosition(initial);

		/**
		 * @todo These controls should not be inside abstract component classes
		 */
		for (let i = 0, l = this.#children.length; i < l; i++) {
			this.#children[i].compute(initial.clone(), size.clone());
		}
	}
}