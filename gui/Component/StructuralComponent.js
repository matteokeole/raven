import {Component} from "./Component.js";
import {Vector2} from "../../math/index.js";

/**
 * @typedef {Object} StructuralComponentDescriptor
 * @property {Number} alignment
 * @property {?Vector2} [margin]
 * @property {Vector2} size
 * @property {?Record.<String, Function>} [events]
 * @property {Component[]} children
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
	 * @param {StructuralComponentDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#children = descriptor.children;
	}

	getChildren() {
		return this.#children;
	}

	/**
	 * @param {Vector2} initial Cloned parent top left corner
	 * @param {Vector2} parentSize Cloned parent size
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