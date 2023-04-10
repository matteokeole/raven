import {WebGLRenderer} from "./index.js";

export function AbstractInstance() {
	/**
	 * @private
	 * @type {?WebGLRenderer}
	 */
	let renderer;

	/**
	 * @private
	 * @type {?WebGL2RenderingContext}
	 */
	let gl;

	/**
	 * @private
	 * @type {Object.<String, *>}
	 */
	const parameters = {
		frames_per_second: 60,
		resize_delay: 50,
	};

	/**
	 * @private
	 * @type {?Number}
	 */
	let animationFrameRequestId;

	/** @private */
	function loop() {
		animationFrameRequestId = requestAnimationFrame(loop);

		render();
	}

	/** @private */
	function render() {
		/** @todo Get the number of canvas textures */

		gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, _);
	}

	/** @returns {?WebGLRenderer} */
	this.getRenderer = () => renderer;

	/**
	 * @param {String} name
	 * @returns {*}
	 */
	this.getParameter = name => parameters[name];

	/**
	 * @param {String} name
	 * @param {*} value
	 */
	this.setParameter = (name, value) => void (parameters[name] = value);

	this.build = function() {
		renderer = new WebGLRenderer();
		renderer.build();

		gl = renderer.getContext();
		// gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		// gl.enable(gl.BLEND);
		// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		/** @todo Set renderer viewport */
		/** @todo Set event listeners on canvas */
	};

	this.run = loop;

	this.pause = function() {
		cancelAnimationFrame(animationFrameRequestId);

		animationFrameRequestId = null;
	};

	this.dispose = function() {
		this.pause();

		/** @todo Dispose renderer composites */

		renderer.dispose();
		renderer = gl = null;
	};
}