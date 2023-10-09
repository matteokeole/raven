import {Component} from "./Component.js";
import {Alignment} from "../index.js";

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
			case Alignment.topCenter:
			case Alignment.center:
			case Alignment.bottomCenter:
				initial[0] += o[0] * .5 + m[0];

				break;
			case Alignment.topRight:
			case Alignment.centerRight:
			case Alignment.bottomCenter:
				initial[0] += o[0] - m[0];

				break;
		}

		switch (alignment) {
			case Alignment.centerLeft:
			case Alignment.center:
			case Alignment.centerRight:
				initial[1] += o[1] * .5 + m[1];

				break;
			case Alignment.bottomLeft:
			case Alignment.bottomCenter:
			case Alignment.bottomCenter:
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