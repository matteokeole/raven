import {Instance} from "../Instance/index.js";
import {Vector4} from "../math/index.js";
import {WebGLRenderer} from "../Renderer/index.js";
import {Scene} from "../Scene/Scene.js";

/**
 * @typedef {Object} CompositeDescriptor
 * @property {WebGLRenderer} renderer
 * @property {Instance} instance
 */

/**
 * @todo Composites should not have access to the instance
 * 
 * @abstract
 */
export class Composite {
	/**
	 * @type {WebGLRenderer}
	 */
	_renderer;

	/**
	 * @type {Scene}
	 */
	_scene;

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
	 * @param {CompositeDescriptor} descriptor
	 */
	constructor(descriptor) {
		this._renderer = descriptor.renderer;
		this._scene = new Scene();
		this.#instance = descriptor.instance;
		this.#isAnimatable = false;
	}

	getRenderer() {
		return this._renderer;
	}

	getInstance() {
		return this.#instance;
	}

	getIndex() {
		return this.#index;
	}

	/**
	 * @param {?Number} index
	 */
	setIndex(index) {
		this.#index = index;
	}

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

	/**
	 * @abstract
	 * @param {KeyboardEvent} event
	 */
	onKeyPress(event) {}

	/**
	 * @abstract
	 * @param {KeyboardEvent} event
	 */
	onKeyRelease(event) {}

	/**
	 * @abstract
	 * @param {KeyboardEvent} event
	 */
	onKeyRepeat(event) {}

	/**
	 * @abstract
	 * @param {MouseEvent} event
	 */
	onMouseDown(event) {}

	/**
	 * @abstract
	 * @param {MouseEvent} event
	 */
	onMouseMove(event) {}
}