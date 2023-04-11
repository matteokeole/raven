import {WebGLRenderer} from "../index.js";
import {Vector2} from "../math/index.js";

/** @param {WebGLRenderer} renderer */
export function AbstractInstance(renderer) {
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
	 * @type {RendererComposite[]}
	 */
	const composites = [];

	/**
	 * @private
	 * @type {Number}
	 */
	let compositeCount = 0;

	const compositeTextures = [];

	const compositeTextureIndices = new Uint8Array();

	/**
	 * @private
	 * @type {?Number}
	 */
	let animationFrameRequestId;

	/**
	 * @private
	 * @type {Boolean}
	 */
	let running = false;

	/** @private */
	const loop = function() {
		animationFrameRequestId = requestAnimationFrame(loop);

		/** @todo `renderer.update()`? */

		renderer.render(compositeCount);
	}.bind(this);

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

	/** @param {RendererComposite[]} rendererComposites */
	this.setComposites = function(rendererComposites) {
		compositeCount = rendererComposites.length;

		for (let i = 0, composite; i < compositeCount; i++) {
			composite = rendererComposites[i];
			composite.setIndex(i);

			composites.push(composite);
		}
	};

	/**
	 * @param {Number} index
	 * @param {OffscreenCanvas} texture
	 */
	this.updateCompositeTexture = function(index, texture) {
		const gl = renderer.getContext();

		gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, index, texture.clientWidth, texture.clientHeight, 1, gl.RGBA, gl.UNSIGNED_BYTE, texture);
	}

	this.build = async function() {
		await renderer.build(
			this.getParameter("shader_path"),
			new Vector2(screen.width, screen.height),
			compositeCount,
		);

		const viewport = new Vector2(innerWidth, innerHeight).multiplyScalar(devicePixelRatio);

		renderer.setViewport(viewport);

		for (let i = 0, composite; i < compositeCount; i++) {
			composite = composites[i];

			composite.build();
			composite.getRenderer().setViewport(viewport);
		}

		/** @todo Set event listeners on canvas */
	};

	/**
	 * @todo Start the loop with `requestAnimationFrame`
	 * 
	 * @throws {Error}
	 */
	this.run = function() {
		if (running) throw Error("This instance is already running.");

		running = true;

		loop();
	};

	/** @throws {Error} */
	this.pause = function() {
		if (!running) throw Error("This instance is already paused.");

		cancelAnimationFrame(animationFrameRequestId);

		animationFrameRequestId = null;
		running = false;
	};

	this.dispose = function() {
		if (gl === null) return console.log("This exception occurred before building the instance.");
		if (running) this.pause();

		gl = null;

		for (let i = 0; i < compositeCount; i++) composites[i].getRenderer().dispose();

		renderer.dispose();
	};
}