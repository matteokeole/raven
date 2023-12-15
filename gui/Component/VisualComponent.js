import {Component} from "./Component.js";
import {Subcomponent} from "../index.js";
import {Composite} from "../../index.js";
import {Vector2} from "../../math/index.js";
import {TextureWrapper} from "../../wrappers/index.js";

/**
 * @typedef {Object} VisualComponentDescriptor
 * @property {Number} alignment
 * @property {?Vector2} [margin]
 * @property {Vector2} size
 * @property {?String[]} [events]
 * @property {?TextureWrapper} [texture]
 */

/**
 * @abstract
 */
export class VisualComponent extends Component {
	/**
	 * @type {?TextureWrapper}
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
	 * @param {?TextureWrapper} texture
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