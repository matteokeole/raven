import {Composite, WebGLRenderer} from "./index.js";
import {Vector2, intersects} from "./math/index.js";

/**
 * @abstract
 */
export class Instance {
	/**
	 * @type {WebGLRenderer}
	 */
	#renderer;

	/**
	 * @type {Composite[]}
	 */
	#composites;

	/**
	 * @type {Number}
	 */
	#compositeCount;

	/**
	 * @type {?ResizeObserver}
	 */
	#resizeObserver;

	/**
	 * @type {Vector2}
	 */
	#pointer;

	/**
	 * @type {Object.<String, *>}
	 */
	#listeners;

	/**
	 * @type {Object.<String, *>}
	 */
	_parameters;

	/**
	 * @type {Number}
	 */
	#framesPerSecond;

	/**
	 * @type {Number}
	 */
	#frameIndex;

	/**
	 * @type {Number}
	 */
	#frameInterval;

	/**
	 * @type {Number}
	 */
	#timeSinceLastFrame;

	/**
	 * @type {?Number}
	 */
	#animationFrameRequestId;

	/**
	 * @type {Boolean}
	 */
	#isFirstResize;

	/**
	 * @type {Boolean}
	 */
	#isRunning;

	/**
	 * @param {WebGLRenderer} renderer
	 */
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
		this._parameters = {
			current_scale: 0,
			font_path: "",
			shader_path: "",
			texture_path: "",
		};
		this.#framesPerSecond = 60;
		this.#frameIndex = 0;
		this.#frameInterval = 60 / 1000;
		this.#timeSinceLastFrame = 0;
		this.#isFirstResize = true;
		this.#isRunning = false;
	}

	/**
	 * @returns {WebGLRenderer}
	 */
	getRenderer() {
		return this.#renderer;
	}

	/**
	 * @returns {Composite[]}
	 */
	getComposites() {
		return this.#composites;
	}

	/**
	 * @param {Composite[]} composites
	 */
	setComposites(composites) {
		this.#compositeCount = composites.length;

		for (let i = 0, composite; i < this.#compositeCount; i++) {
			composite = composites[i];
			composite.setIndex(i);

			this.#composites.push(composite);
		}
	};

	/**
	 * @returns {ResizeObserver}
	 */
	getResizeObserver() {
		return this.#resizeObserver;
	}

	/**
	 * @param {ResizeObserver} resizeObserver
	 */
	setResizeObserver(resizeObserver) {
		this.#resizeObserver = resizeObserver;
	}

	/**
	 * @param {String} key
	 * @returns {*}
	 * @throws {ReferenceError}
	 */
	getParameter(key) {
		if (!(key in this._parameters)) {
			throw new ReferenceError(`Undefined parameter key "${key}".`);
		}

		return this._parameters[key];
	}

	/**
	 * @param {String} key
	 * @param {*} value
	 * @throws {ReferenceError}
	 */
	setParameter(key, value) {
		if (!(key in this._parameters)) {
			throw new ReferenceError(`Undefined parameter key "${key}".`);
		}

		this._parameters[key] = value;
	}

	/**
	 * @returns {Number}
	 */
	getFramesPerSecond() {
		return this.#framesPerSecond;
	}

	/**
	 * @param {Number} framesPerSecond
	 */
	setFramesPerSecond(framesPerSecond) {
		this.#framesPerSecond = framesPerSecond;
	}

	/**
	 * @returns {Boolean}
	 */
	isFirstResize() {
		return this.#isFirstResize;
	}

	/**
	 * @param {Boolean} isFirstResize
	 */
	setFirstResize(isFirstResize) {
		this.#isFirstResize = isFirstResize;
	}

	async build() {
		/**
		 * @todo Thes methods don't belong to the base WebGLRenderer class
		 */
		this.#renderer.setCompositeCount(this.#compositeCount);
		this.#renderer.setShaderPath(this._parameters["shader_path"]);

		await this.#renderer.build();

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

		canvas.addEventListener("mousedown", this.#onMouseDown);
		canvas.addEventListener("mousemove", this.#onMouseMove);
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

	/**
	 * @throws {Error}
	 */
	loop() {
		if (this.#isRunning) {
			throw new Error("This instance is already running.");
		}

		this.#frameIndex = 0;
		this.#frameInterval = this.#framesPerSecond === 0 ?
			0 :
			1000 / this.#framesPerSecond;
		this.#timeSinceLastFrame = 0;
		this.#isRunning = true;

		this.#loop();
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

	#loop = function() {
		this.#animationFrameRequestId = requestAnimationFrame(this.#loop);
		const time = performance.now();
		const delta = time - this.#timeSinceLastFrame;

		if (delta > this.#frameInterval) {
			this.#timeSinceLastFrame = time - delta / this.#frameInterval;

			try {
				this.#update(this.#frameIndex);
				this.#renderer.render();
				this.#frameIndex++;
			} catch (error) {
				console.error(error);

				cancelAnimationFrame(this.#animationFrameRequestId);

				this.#animationFrameRequestId = null;
				this.#isRunning = false;
			}
		}
	}.bind(this);

	/**
	 * @param {Number} frameIndex
	 */
	#update(frameIndex) {
		for (let i = 0; i < this.#compositeCount; i++) {
			if (!this.#composites[i].isAnimatable()) continue;

			this.#composites[i].update(frameIndex);
		}
	}

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
			.divideScalar(this._parameters["current_scale"]);

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
}