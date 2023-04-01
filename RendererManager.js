import {Instance} from "./Instance.js";
import {WebGLRenderer} from "./WebGLRenderer.js";

/**
 * @todo Add getters
 */
export function RendererManager(instance, renderer) {
	/** @type {Instance} */
	this.instance = instance;

	/** @type {WebGLRenderer} */
	this.renderer = renderer;
}

/** @abstract */
RendererManager.prototype.init;

/** @abstract */
RendererManager.prototype.render;

/** @abstract */
RendererManager.prototype.resize;