import {WebGLRenderer} from "./WebGLRenderer.draft.js";

export class InstanceRenderer extends WebGLRenderer {
	/**
	 * @type {?HTMLCanvasElement}
	 */
	_canvas;

	/**
	 * @param {HTMLCanvasElement} [canvas]
	 */
	constructor(canvas = null) {
		super();

		this._canvas = canvas;
	}

	build() {
		this._canvas ??= document.createElement("canvas");

		super.build();
	}

	dispose() {
		super.dispose();

		this._canvas.remove();
	}
}