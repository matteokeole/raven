import {Matrix3, Vector3} from "../math/index.js";

export function Camera() {
	/** @type {Vector3} */
	let position = new Vector3(0, 0, 0);

	/** @type {Vector3} */
	let rotation = new Vector3(0, 0, 0);

	/** @type {Matrix3} */
	let projectionMatrix = Matrix3.identity();

	/** @returns {Vector3} */
	this.getPosition = () => position;
	
	/** @param {Vector3} value */
	this.setPosition = value => void (position = value);

	/** @returns {Vector3} */
	this.getRotation = () => rotation;

	/** @param {Vector3} value */
	this.setRotation = value => void (rotation = value);

	/** @returns {Matrix3} */
	this.getProjectionMatrix = () => projectionMatrix;

	/** @param {Matrix3} value */
	this.setProjectionMatrix = value => void (projectionMatrix = value);
}

/** @abstract */
Camera.prototype.updateProjectionMatrix;