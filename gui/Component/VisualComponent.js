import {Component} from "./Component.js";
import {Subcomponent} from "../index.js";
import {Composite} from "../../index.js";
import {Vector2} from "../../math/index.js";
import {TextureContainer} from "../../wrappers/index.js";

/**
 * @typedef {Object} VisualComponentDescriptor
 * @property {Number} alignment
 * @property {?Vector2} [margin]
 * @property {Vector2} size
 * @property {?Record.<String, Function>} [events]
 * @property {?TextureContainer} [texture]
 */

/**
 * @abstract
 */
export class VisualComponent extends Component {
	/**
	 * @type {?TextureContainer}
	 */
	#texture;

	/**
	 * @type {Subcomponent[]}
	 */
	#subcomponents;

	/**
	 * @param {VisualComponentDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#subcomponents = [];
		this.#texture = descriptor.texture ?? null;
	}

	getTexture() {
		return this.#texture;
	}

	/**
	 * @param {?TextureContainer} texture
	 */
	setTexture(texture) {
		this.#texture = texture;
	}

	getSubcomponents() {
		return this.#subcomponents;
	}

	/**
	 * @param {Subcomponent[]} subcomponents
	 */
	setSubcomponents(subcomponents) {
		this.#subcomponents = subcomponents;
	}

	/**
	 * @todo `yield` instead of `return` to trigger multiple renders cleanly?
	 * 
	 * @abstract
	 * @param {Composite} context
	 * @param {Number} frameIndex
	 * @returns {Boolean}
	 */
	update(context, frameIndex) {
		return false;
	}
}