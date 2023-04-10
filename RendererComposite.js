import {Instance, WebGLRenderer} from "./index.js";

/**
 * @param {WebGLRenderer} renderer
 * @param {Instance} instance
 */
export function RendererComposite(renderer, instance) {
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
RendererComposite.prototype.init;

/** @abstract */
RendererComposite.prototype.render;

/** @abstract */
RendererComposite.prototype.resize;