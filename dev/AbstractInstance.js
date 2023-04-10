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

	/**
	 * @private
	 * @type {?Number}
	 */
	let animationFrameRequestId;

	let a = 0;

	/** @private */
	const loop = function() {
		animationFrameRequestId = requestAnimationFrame(loop);

		/** @todo `renderer.update()`? */

		renderer.render();
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

		for (let i = 0; i < compositeCount; i++) composites.push(rendererComposites[i]);
	};

	this.build = async function() {
		await renderer.build(this.getParameter("shader_path"));

		const viewport = new Vector2(innerWidth, innerHeight).multiplyScalar(devicePixelRatio);

		renderer.setViewport(viewport);

		for (let i = 0, renderer; i < compositeCount; i++) {
			renderer = composites[i].getRenderer();

			renderer.build();
			renderer.setViewport(viewport);
		}

		/** @todo Set event listeners on canvas */
	};

	/** @todo Start the loop with `requestAnimationFrame` */
	this.run = loop;

	this.pause = function() {
		cancelAnimationFrame(animationFrameRequestId);

		animationFrameRequestId = null;
	};

	this.dispose = function() {
		this.pause();

		/** @todo Dispose renderer composites */

		gl = null;

		renderer.dispose();
	};
}