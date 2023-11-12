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
 * @property {?Object.<String, Function>} [events]
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
	constructor({alignment, margin, size, events, texture = null}) {
		super({alignment, margin, size, events});

		this.#subcomponents = [];
		this.#texture = texture;
	}

	/**
	 * @returns {?TextureContainer}
	 */
	getTexture() {
		return this.#texture;
	}

	/**
	 * @param {?TextureContainer} texture
	 */
	setTexture(texture) {
		this.#texture = texture;
	}

	/**
	 * @returns {Subcomponent[]}
	 */
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
	 * @todo `yield` instead of `return` to trigger multiple renders?
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