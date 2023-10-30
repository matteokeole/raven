import {Component} from "./Component.js";
import {Vector2} from "../../math/index.js";

/**
 * @typedef {Number} Alignment
 */

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
	 * @param {Number} options.alignment
	 * @param {Vector2} [options.margin]
	 * @param {Vector2} options.size
	 * @param {Component[]} options.children
	 */
	constructor({alignment, margin, size, children}) {
		super({alignment, margin, size});

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
		super.compute(initial, parentSize);

		/**
		 * @todo These controls should not be inside abstract component classes
		 */
		for (let i = 0, l = this.#children.length; i < l; i++) {
			this.#children[i].compute(
				this.getPosition().clone(),
				this.getSize().clone(),
			);
		}
	}
}