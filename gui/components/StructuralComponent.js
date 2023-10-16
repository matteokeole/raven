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