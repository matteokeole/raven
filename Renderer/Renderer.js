/**
 * @abstract
 */
export class Renderer {
	/**
	 * @type {null|HTMLCanvasElement|OffscreenCanvas}
	 */
	_canvas;

	getCanvas() {
		return this._canvas;
	}
}