import {Instance} from "./Instance.js";
import {WebGLRenderer} from "./WebGLRenderer.js";

/**
 * @param {WebGLRenderer} renderer
 * @param {Instance} instance
 */
export function RendererManager(renderer, instance) {
	/** @returns {WebGLRenderer} */
	this.getRenderer = () => renderer;

	/** @returns {Instance} */
	this.getInstance = () => instance;
}

/** @abstract */
RendererManager.prototype.init;

/** @abstract */
RendererManager.prototype.render;

/** @abstract */
RendererManager.prototype.resize;