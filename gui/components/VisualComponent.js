import {Component} from "./Component.js";
import {Subcomponent} from "../index.js";
import {Composite} from "../../index.js";
import {Vector2} from "../../math/index.js";
import {Texture} from "../../wrappers/index.js";

/**
 * @abstract
 */
export class VisualComponent extends Component {
	/**
	 * @type {Subcomponent[]}
	 */
	#subcomponents;

	/**
	 * @type {?Texture}
	 */
	#texture;

	/**
	 * @param {Object} options
	 * @param {Number} options.alignment
	 * @param {Vector2} [options.margin]
	 * @param {Vector2} options.size
	 */
	constructor({alignment, margin, size}) {
		super({alignment, margin, size});

		this.#subcomponents = [];
		this.#texture = null;
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
	 * @returns {?Texture}
	 */
	getTexture() {
		return this.#texture;
	}

	/**
	 * @param {?Texture} texture
	 */
	setTexture(texture) {
		this.#texture = texture;
	}

	/**
	 * @abstract
	 * @param {Composite} context
	 * @param {Number} frameIndex
	 * @returns {Boolean}
	 */
	update(context, frameIndex) {
		return false;
	}
}