import {Composite, WebGLRenderer} from "./index.js";
import {Vector2, intersects} from "./math/index.js";

/** @abstract */
export class AbstractInstance {
	/** @type {WebGLRenderer} */
	#renderer;

	/** @type {Composite[]} */
	#composites;

	/** @type {Number} */
	#compositeCount;

	/** @type {?ResizeObserver} */
	#resizeObserver;

	/** @type {Vector2} */
	#pointer;

	/** @type {Object.<String, *>} */
	#listeners;

	/** @type {Object.<String, *>} */
	#parameters;

	/** @type {?Number} */
	#animationFrameRequestId;

	/** @type {Boolean} */
	#isFirstResize;

	/** @type {Boolean} */
	#isRunning;

	#loop = function() {
		this.#animationFrameRequestId = requestAnimationFrame(this.#loop);
		this.#renderer.render();
	}.bind(this);

	#onMouseDown = function() {
		for (let i = 0, l = this.#listeners.mouse_down_count, listener; i < l; i++) {
			listener = this.#listeners.mouse_down[i];

			if (!intersects(this.#pointer, listener.component.getPosition(), listener.component.getSize())) {
				continue;
			}

			listener(this.#pointer);

			break;
		}
	}.bind(this);

	/**
	 * @param {Object} event
	 * @param {Number} event.clientX
	 * @param {Number} event.clientY
	 */
	#onMouseMove = function({clientX, clientY}) {
		this.#pointer[0] = clientX;
		this.#pointer[1] = clientY;
		this.#pointer
			.multiplyScalar(devicePixelRatio)
			.divideScalar(this.#parameters["current_scale"]);

		let i, l, listener;

		for (i = 0, l = this.#listeners.mouse_enter_count; i < l; i++) {
			listener = this.#listeners.mouse_enter[i];

			if (!intersects(this.#pointer, listener.component.getPosition(), listener.component.getSize())) {
				continue;
			}
			if (listener.component.getIsHovered()) {
				continue;
			}

			listener.component.setIsHovered(true);
			listener(this.#pointer);
		}

		for (i = 0, l = this.#listeners.mouse_leave_count; i < l; i++) {
			listener = this.#listeners.mouse_leave[i];

			if (intersects(this.#pointer, listener.component.getPosition(), listener.component.getSize())) {
				continue;
			}
			if (!listener.component.getIsHovered()) {
				continue;
			}

			listener.component.setIsHovered(false);
			listener(this.#pointer);
		}
	}.bind(this);

	/** @param {WebGLRenderer} renderer */
	constructor(renderer) {
		this.#renderer = renderer;
		this.#composites = [];
		this.#compositeCount = 0;
		this.#pointer = new Vector2();
		this.#listeners = {
			mouse_down: [],
			mouse_down_count: 0,
			mouse_enter: [],
			mouse_enter_count: 0,
			mouse_leave: [],
			mouse_leave_count: 0,
		};
		this.#parameters = {
			current_scale: 0,
			font_path: "",
			shader_path: "",
			texture_path: "",
		};
		this.#isFirstResize = true;
		this.#isRunning = false;
	}

	/** @returns {WebGLRenderer} */
	getRenderer() {
		return this.#renderer;
	}

	/** @returns {Composite[]} */
	getComposites() {
		return this.#composites;
	}

	/** @param {Composite[]} composites */
	setComposites(composites) {
		this.#compositeCount = composites.length;

		for (let i = 0, composite; i < this.#compositeCount; i++) {
			composite = composites[i];
			composite.setIndex(i);

			this.#composites.push(composite);
		}
	};

	/** @returns {ResizeObserver} */
	getResizeObserver() {
		return this.#resizeObserver;
	}

	/** @param {ResizeObserver} resizeObserver */
	setResizeObserver(resizeObserver) {
		this.#resizeObserver = resizeObserver;
	}

	/**
	 * @param {String} key
	 * @returns {*}
	 * @throws {ReferenceError}
	 */
	getParameter(key) {
		if (!(key in this.#parameters)) {
			throw new ReferenceError(`Undefined parameter key "${key}".`);
		}

		return this.#parameters[key];
	}

	/**
	 * @param {String} key
	 * @param {*} value
	 * @throws {ReferenceError}
	 */
	setParameter(key, value) {
		if (!(key in this.#parameters)) {
			throw new ReferenceError(`Undefined parameter key "${key}".`);
		}

		this.#parameters[key] = value;
	}

	/** @returns {Boolean} */
	isFirstResize() {
		return this.#isFirstResize;
	}

	/** @param {Boolean} isFirstResize */
	setFirstResize(isFirstResize) {
		this.#isFirstResize = isFirstResize;
	}

	async build() {
		/** @todo This method doesn't belong to the abstract WebGLRenderer class */
		this.#renderer.setCompositeCount(this.#compositeCount);

		await this.#renderer.build(this.#parameters["shader_path"]);

		const viewport = new Vector2(innerWidth, innerHeight)
			.multiplyScalar(devicePixelRatio)
			.floor();

		this.#renderer.setViewport(viewport);

		for (let i = 0, composite; i < this.#compositeCount; i++) {
			composite = this.#composites[i];

			await composite.build();

			composite.getRenderer().setViewport(viewport);
		}

		const canvas = this.#renderer.getCanvas();

		canvas.onmousedown = this.#onMouseDown;
		canvas.onmousemove = this.#onMouseMove;
	}

	/**
	 * @param {String} event
	 * @param {Function} listener
	 */
	addListener(event, listener) {
		this.#listeners[event].push(listener);
		this.#listeners[`${event}_count`]++;
	}

	/**
	 * @param {String} event
	 * @param {Function} listener
	 */
	removeListener(event, listener) {
		this.#listeners[event].splice(this.#listeners[event].indexOf(listener), 1);
		this.#listeners[`${event}_count`]--;
	}

	/** @throws {Error} */
	run() {
		if (this.#isRunning) {
			throw new Error("This instance is already running.");
		}

		this.#isRunning = true;

		requestAnimationFrame(this.#loop);
	}

	/** @throws {Error} */
	pause() {
		if (!this.#isRunning) {
			throw new Error("This instance is already paused.");
		}

		cancelAnimationFrame(this.#animationFrameRequestId);

		this.#animationFrameRequestId = null;
		this.#isRunning = false;
	}

	dispose() {
		if (this.#isRunning) {
			this.pause();
		}

		for (let i = 0; i < this.#compositeCount; i++) {
			this.#composites[i].getRenderer().dispose();
		}

		this.#renderer.getCanvas().remove();
		this.#renderer.dispose();
	}
}