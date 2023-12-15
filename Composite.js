import {Instance, WebGLRenderer} from "./index.js";
import {Vector4} from "./math/index.js";
import {Scene} from "./Scene/Scene.js";

/**
 * @todo Composites shoudn't have access to the instance
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
	 * @param {Object} options
	 * @param {WebGLRenderer} options.renderer
	 * @param {Instance} options.instance
	 */
	constructor({renderer, instance}) {
		this._renderer = renderer;
		this._scene = new Scene();
		this.#instance = instance;
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
	onKeyRepeat(event) {}

	/**
	 * @abstract
	 * @param {KeyboardEvent} event
	 */
	onKeyRelease(event) {}

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