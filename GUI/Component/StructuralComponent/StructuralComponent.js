import {Component} from "../index.js";
import {Vector2} from "../../../math/index.js";

/**
 * @typedef {Object} StructuralComponentDescriptor
 * @property {Number} alignment
 * @property {Vector2} [margin]
 * @property {Vector2} size
 * @property {String[]} [events]
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
}