import {Camera} from "./index.js";
import {Matrix3, Vector2} from "../math/index.js";
import {extend} from "../utils/index.js";

/**
 * @extends Camera
 * @param {Vector2} viewport
 */
export function OrthographicCamera(viewport) {
	Camera.call(this);

	/** @type {Vector2} */
	this.getViewport = () => viewport;

	/** @param {Vector2} value */
	this.setViewport = value => void (viewport = value);
}

extend(OrthographicCamera, Camera);

/** @override */
OrthographicCamera.prototype.updateProjectionMatrix = function() {
	this.setProjectionMatrix(Matrix3.projection(this.getViewport()));
};