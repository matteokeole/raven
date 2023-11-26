import {Camera} from "./index.js";
import {Matrix3, Vector2} from "../math/index.js";

export class OrthographicCamera extends Camera {
	/**
	 * @type {Vector2}
	 */
	#viewport;

	/**
	 * @type {Vector2}
	 */
	constructor(viewport) {
		super();

		this.#viewport = viewport;
	}

	getViewport() {
		return this.#viewport;
	}

	/**
	 * @param {Vector2} viewport
	 */
	setViewport(viewport) {
		this.#viewport = viewport;
	}

	updateProjection() {
		this.setProjection(Matrix3.orthographic(this.#viewport));
	}
}