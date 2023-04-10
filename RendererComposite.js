import {Instance, WebGLRenderer} from "./index.js";

/**
 * @param {WebGLRenderer} renderer
 * @param {Instance} instance
 */
export function RendererComposite(renderer, instance) {
	/** @returns {WebGLRenderer} */
	this.getRenderer = () => renderer;

	/** @returns {Instance} */
	this.getInstance = () => instance;
}

/** @abstract */
RendererComposite.prototype.init;

/** @abstract */
RendererComposite.prototype.render;

/** @abstract */
RendererComposite.prototype.resize;