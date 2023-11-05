import {Component} from "./Component.js";
import {Vector2} from "../../math/index.js";

/**
 * @typedef {Object} StructuralComponentDescriptor
 * @property {Number} alignment
 * @property {?Vector2} [margin]
 * @property {Vector2} size
 * @property {?Object.<String, Function>} [on]
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
	constructor({alignment, margin, size, on, children}) {
		super({alignment, margin, size, on});

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