import {Composite, WebGLRenderer} from "./index.js";
import {Vector2, intersects} from "./math/index.js";

/**
 * @abstract
 * @param {WebGLRenderer} renderer
 */
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
	 * @type {Vector2}
	 */
	const pointer = new Vector2();

	/**
	 * @private
	 * @type {Object}
	 */
	const listeners = {
		mouse_down: [],
		mouse_down_count: 0,
		mouse_enter: [],
		mouse_enter_count: 0,
		mouse_leave: [],
		mouse_leave_count: 0,
	};

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

	function onMouseDown() {
		for (let i = 0, l = listeners.mouse_down_count, listener; i < l; i++) {
			listener = listeners.mouse_down[i];

			if (!intersects(pointer, listener.component.getPosition(), listener.component.getSize())) continue;

			listener(pointer);

			break;
		}
	}

	/**
	 * @param {Object} event
	 * @param {Number} event.clientX
	 * @param {Number} event.clientY
	 */
	function onMouseMove({clientX, clientY}) {
		pointer[0] = clientX;
		pointer[1] = clientY;
		pointer
			.multiplyScalar(devicePixelRatio)
			.divideScalar(parameters["current_scale"]);

		let i, l, listener;

		for (i = 0, l = listeners.mouse_enter_count; i < l; i++) {
			listener = listeners.mouse_enter[i];

			if (!intersects(pointer, listener.component.getPosition(), listener.component.getSize())) continue;
			if (listener.component.getIsHovered()) continue;

			listener.component.setIsHovered(true);
			listener(pointer);
		}

		for (i = 0, l = listeners.mouse_leave_count; i < l; i++) {
			listener = listeners.mouse_leave[i];

			if (intersects(pointer, listener.component.getPosition(), listener.component.getSize())) continue;
			if (!listener.component.getIsHovered()) continue;

			listener.component.setIsHovered(false);
			listener(pointer);
		}
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

		renderer.getCanvas().onmousedown = onMouseDown;
		renderer.getCanvas().onmousemove = onMouseMove;
	};

	/**
	 * @param {String} event
	 * @param {Function} listener
	 */
	this.addListener = function(event, listener) {
		listeners[event].push(listener);
		listeners[`${event}_count`]++;
	};

	/**
	 * @param {String} event
	 * @param {Function} listener
	 */
	this.removeListener = function(event, listener) {
		listeners[event].splice(listeners[event].indexOf(listener), 1);
		listeners[`${event}_count`]--;
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