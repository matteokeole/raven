import {Instance, WebGLRenderer} from "./index.js";
import {Vector4} from "./math/index.js";

/**
 * @abstract
 */
export class Composite {
	/**
	 * @type {WebGLRenderer}
	 */
	#renderer;

	/**
	 * @type {Instance}
	 */
	#instance;

	/**
	 * @type {?Number}
	 */
	#index;

	/**
	 * @type {Boolean}
	 */
	#isAnimatable;

	/**
	 * @param {Object} options
	 * @param {WebGLRenderer} options.renderer
	 * @param {Instance} options.instance
	 */
	constructor({renderer, instance}) {
		this.#renderer = renderer;
		this.#instance = instance;
		this.#isAnimatable = false;
	}

	/**
	 * @returns {WebGLRenderer}
	 */
	getRenderer() {
		return this.#renderer;
	}

	/**
	 * @returns {Instance}
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
	 * @returns {Boolean}
	 */
	isAnimatable() {
		return this.#isAnimatable;
	}

	/**
	 * @param {Boolean} isAnimatable
	 */
	setAnimatable(isAnimatable) {
		this.#isAnimatable = isAnimatable;
	}

	/**
	 * @abstract
	 */
	async build() {}

	/**
	 * @abstract
	 * @param {Number} frameIndex
	 */
	update(frameIndex) {}

	/**
	 * @abstract
	 */
	render() {}

	/**
	 * @abstract
	 * @param {Vector4} viewport
	 */
	resize(viewport) {}
}