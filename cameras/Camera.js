import {Matrix3, Vector3} from "../math/index.js";

/** @abstract */
export class Camera {
	/** @type {Matrix3} */
	#projection;

	/** @type {Vector3} */
	#position;

	/** @type {Vector3} */
	#rotation;

	constructor() {
		this.#projection = new Matrix3();
		this.#position = new Vector3();
		this.#rotation = new Vector3();
	}

	/** @returns {Matrix3} */
	getProjection() {
		return this.#projection;
	}

	/** @param {Matrix3} projection */
	setProjection(projection) {
		this.#projection = projection;
	}

	/** @returns {Vector3} */
	getPosition() {
		return this.#position;
	}

	/** @param {Vector3} position */
	setPosition(position) {
		this.#position = position;
	}

	/** @returns {Vector3} */
	getRotation() {
		return this.#rotation;
	}

	/** @param {Vector3} rotation */
	setRotation(rotation) {
		this.#rotation = rotation;
	}

	/** @abstract */
	updateProjection() {}
}