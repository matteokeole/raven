import {Composite, WebGLRenderer} from "./index.js";
import {Vector2} from "./math/index.js";

/** @param {WebGLRenderer} renderer */
export function AbstractInstance(renderer) {
	/**
	 * @private
	 * @type {Composite[]}
	 */
	const composites = [];

	/**
	 * @private
	 * @type {Number}
	 */
	let compositeCount = 0;

	/**
	 * @private
	 * @type {?ResizeObserver}
	 */
	let resizeObserver;

	/**
	 * @private
	 * @type {Object.<String, *>}
	 */
	const parameters = {};

	/**
	 * @private
	 * @type {?Number}
	 */
	let animationFrameRequestId;

	/**
	 * @private
	 * @type {Boolean}
	 */
	let isFirstResize = true;

	/**
	 * @private
	 * @type {Boolean}
	 */
	let running = false;

	function loop() {
		animationFrameRequestId = requestAnimationFrame(loop);

		renderer.render();
	}

	/** @returns {WebGLRenderer} */
	this.getRenderer = () => renderer;

	/** @returns {Composite[]} */
	this.getComposites = () => composites;

	/** @param {Composite[]} _composites */
	this.setComposites = function(_composites) {
		compositeCount = _composites.length;

		for (let i = 0, composite; i < compositeCount; i++) {
			composite = _composites[i];
			composite.setIndex(i);

			composites.push(composite);
		}
	};

	/** @returns {?ResizeObserver} */
	this.getResizeObserver = () => resizeObserver;

	/** @param {ResizeObserver} value */
	this.setResizeObserver = value => void (resizeObserver = value);

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

	/** @returns {Boolean} */
	this.getIsFirstResize = () => isFirstResize;

	/** @param {Boolean} value */
	this.setIsFirstResize = value => void (isFirstResize = value);

	this.build = async function() {
		renderer.setCompositeCount(compositeCount);
		await renderer.build(this.getParameter("shader_path"));

		const viewport = new Vector2(innerWidth, innerHeight)
			.multiplyScalar(devicePixelRatio)
			.floor();

		renderer.setViewport(viewport);

		for (let i = 0, composite; i < compositeCount; i++) {
			composite = composites[i];

			await composite.build();
			composite.getRenderer().setViewport(viewport);
		}

		/** @todo Set event listeners on canvas */
	};

	/** @throws {Error} */
	this.run = function() {
		if (running) throw Error("This instance is already running.");

		running = true;

		requestAnimationFrame(loop);
	};

	/** @throws {Error} */
	this.pause = function() {
		if (!running) throw Error("This instance is already paused.");

		cancelAnimationFrame(animationFrameRequestId);

		animationFrameRequestId = null;
		running = false;
	};

	this.dispose = function() {
		if (running) this.pause();

		for (let i = 0; i < compositeCount; i++) composites[i].getRenderer().dispose();

		renderer.getCanvas().remove();
		renderer.dispose();
	};
}