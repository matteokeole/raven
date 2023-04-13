import {Instance, WebGLRenderer} from "./index.js";

/**
 * @param {WebGLRenderer} renderer
 * @param {Instance} instance
 */
export function Composite(renderer, instance) {
	/**
	 * @private
	 * @type {?Number}
	 */
	let index;

	/** @returns {WebGLRenderer} */
	this.getRenderer = () => renderer;

	/** @returns {Instance} */
	this.getInstance = () => instance;

	/** @returns {?Number} */
	this.getIndex = () => index;

	/** @param {Number} value */
	this.setIndex = value => void (index = value);
}

/** @abstract */
Composite.prototype.build;

/** @abstract */
Composite.prototype.render;

/** @abstract */
Composite.prototype.resize;