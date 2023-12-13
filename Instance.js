import {Composite, InstanceRenderer} from "./index.js";
import {Vector2, Vector4} from "./math/index.js";

/**
 * @abstract
 */
export class Instance {
	/**
	 * @type {InstanceRenderer}
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
	 * @type {Record.<String, *>}
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
	 * @type {?Number}
	 */
	#resizeTimeoutId;

	/**
	 * @type {Boolean}
	 */
	#isRunning;

	/**
	 * @param {InstanceRenderer} renderer
	 */
	constructor(renderer) {
		this.#renderer = renderer;
		this.#composites = [];
		this.#compositeCount = 0;
		this.#resizeObserver = null;
		this.#pointer = new Vector2();
		this._parameters = {
			current_scale: 0,
			font_path: "",
			shader_path: "",
			texture_path: "",
			resize_delay: 0,
		};
		this.#framesPerSecond = 60;
		this.#frameIndex = 0;
		this.#frameInterval = 1000 / 60;
		this.#timeSinceLastFrame = 0;
		this.#animationFrameRequestId = null;
		this.#resizeTimeoutId = null;
		this.#isRunning = false;
	}

	getRenderer() {
		return this.#renderer;
	}

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

	getFramesPerSecond() {
		return this.#framesPerSecond;
	}

	/**
	 * @param {Number} framesPerSecond
	 */
	setFramesPerSecond(framesPerSecond) {
		this.#framesPerSecond = framesPerSecond;
	}

	async build() {
		this.#renderer.setCompositeCount(this.#compositeCount);
		this.#renderer.setShaderPath(this._parameters["shader_path"]);
		this.#renderer.build();

		const viewport = new Vector4(0, 0, innerWidth, innerHeight)
			.multiplyScalar(devicePixelRatio)
			.floor();

		this.#renderer.setViewport(viewport);

		for (let i = 0, composite; i < this.#compositeCount; i++) {
			composite = this.#composites[i];

			await composite.build();

			composite.getRenderer().setViewport(viewport);
		}

		const canvas = this.#renderer.getCanvas();

		addEventListener("keydown", this.#onKeyDown.bind(this));
		addEventListener("keyup", this.#onKeyUp.bind(this));
		canvas.addEventListener("mousedown", this.#onMouseDown.bind(this));
		canvas.addEventListener("mousemove", this.#onMouseMove.bind(this));

		/**
		 * @see {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-resizing-the-canvas.html}
		 */
		this.#resizeObserver = new ResizeObserver(entries => {
			clearTimeout(this.#resizeTimeoutId);

			this.#resizeTimeoutId = setTimeout(
				() => {
					const canvasEntry = entries[0];

					const dpr = devicePixelRatio;
					const viewport = new Vector4(
						0,
						0,
						canvasEntry.devicePixelContentBoxSize?.[0].inlineSize ?? canvasEntry.contentBoxSize[0].inlineSize * dpr,
						canvasEntry.devicePixelContentBoxSize?.[0].blockSize ?? canvasEntry.contentBoxSize[0].blockSize * dpr,
					).floor();

					/**
					 * @type {HTMLCanvasElement}
					 */
					// @ts-ignore
					const canvas = canvasEntry.target;

					canvas.width = viewport[2];
					canvas.height = viewport[3];

					this.resize(viewport, dpr);
				},
				this._parameters["resize_delay"],
			);
		});
	}

	/**
	 * @throws {Error} if the instance is already running
	 */
	loop() {
		if (this.#isRunning) {
			throw new Error("This instance is already running.");
		}

		this.#initResizeObserver();

		this.#frameIndex = 0;
		this.#frameInterval = this.#framesPerSecond === 0 ?
			0 :
			1000 / this.#framesPerSecond;
		this.#timeSinceLastFrame = 0;
		this.#isRunning = true;

		this.#loop();
	}

	/**
	 * @abstract
	 * @param {Vector4} viewport
	 * @param {Number} dpr Device pixel ratio (included in the viewport)
	 */
	resize(viewport, dpr) {}

	dispose() {
		this.#renderer.getCanvas().remove();

		for (let i = 0; i < this.#compositeCount; i++) {
			this.#composites[i].getRenderer().dispose();
		}

		this.#renderer.dispose();
	}

	/**
	 * This method should be called after the canvas has been added to the DOM.
	 */
	#initResizeObserver() {
		try {
			this.#resizeObserver.observe(this.#renderer.getCanvas(), {
				box: "device-pixel-content-box",
			});
		} catch {
			this.#resizeObserver.observe(this.#renderer.getCanvas(), {
				box: "content-box",
			});
		}
	}

	#loop() {
		this.#animationFrameRequestId = requestAnimationFrame(this.#loop.bind(this));

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
	}

	/**
	 * @param {Number} frameIndex
	 */
	#update(frameIndex) {
		for (let i = 0; i < this.#compositeCount; i++) {
			if (!this.#composites[i].isAnimatable()) {
				continue;
			}

			this.#composites[i].update(frameIndex);
		}
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	#onKeyDown(event) {
		for (let i = 0; i < this.#compositeCount; i++) {
			this.#composites[i].onKeyDown(event);
		}	
	}

	/**
	 * @param {KeyboardEvent} event
	 */
	#onKeyUp(event) {
		for (let i = 0; i < this.#compositeCount; i++) {
			this.#composites[i].onKeyUp(event);
		}
	}

	/**
	 * @param {MouseEvent} event
	 */
	#onMouseDown(event) {
		for (let i = 0; i < this.#compositeCount; i++) {
			this.#composites[i].onMouseDown(event);
		}
	}

	/**
	 * @param {MouseEvent} event
	 */
	#onMouseMove(event) {
		this.#pointer[0] = event.clientX;
		this.#pointer[1] = event.clientY;
		this.#pointer
			.multiplyScalar(devicePixelRatio)
			.divideScalar(this._parameters["current_scale"]);

		for (let i = 0; i < this.#compositeCount; i++) {
			this.#composites[i].onMouseMove(event);
		}
	}
}