import {AbstractInstance, WebGLRenderer} from "./index.js";
import {Vector2} from "./math/index.js";

/**
 * @abstract
 */
export class Composite {
	/**
	 * @type {WebGLRenderer}
	 */
	#renderer;

	/**
	 * @type {AbstractInstance}
	 */
	#instance;

	/**
	 * @type {?Number}
	 */
	#index;

	/**
	 * @param {Object} options
	 * @param {WebGLRenderer} options.renderer
	 * @param {AbstractInstance} options.instance
	 */
	constructor({renderer, instance}) {
		this.#renderer = renderer;
		this.#instance = instance;
	}

	/**
	 * @returns {WebGLRenderer}
	 */
	getRenderer() {
		return this.#renderer;
	}

	/**
	 * @returns {AbstractInstance}
	 */
	getInstance() {
		return this.#instance;
	}

	/**
	 * @returns {?Number}
	 */
	getIndex() {
		return this.#index;
	}

	/**
	 * @param {?Number} index
	 */
	setIndex(index) {
		this.#index = index;
	}

	/**
	 * @abstract
	 */
	async build() {}

	/**
	 * @abstract
	 */
	render() {}

	/**
	 * @abstract
	 * @param {Vector2} viewport
	 */
	resize(viewport) {}
}