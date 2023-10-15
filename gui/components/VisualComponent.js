import {Component} from "./Component.js";
import {Subcomponent} from "../index.js";
import {Composite} from "../../Composite.js";
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

	constructor() {
		super(arguments[0]);

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
	 */
	animate(context, frameIndex) {
		throw new Error("Not implemented");
	}
}