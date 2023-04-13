import {Vector2, clampDown, clampUp, intersects} from "./math/index.js";
import {Program} from "./wrappers/index.js";
import {Composite, WebGLRenderer} from "./index.js";

/** @type {Number} */
const DEFAULT_WIDTH = 320;

/** @type {Number} */
const DEFAULT_HEIGHT = 240;

/** @type {Number} */
const RESIZE_DELAY = 50;

/**
 * @deprecated
 * @todo Find a better name
 * @todo Add getters/setters
 * 
 * This holds information about asset base paths, viewport dimensions and GUI scale.
 * 
 * @param {{
 *    fontPath: String,
 *    shaderPath: String,
 *    texturePath: String,
 * }}
 */
export function Instance({fontPath, shaderPath, texturePath}) {
	/**
	 * Prevents the first `ResizeObserver` call.
	 * 
	 * @type {?Boolean}
	 */
	let isFirstResize = true;

	/**
	 * Timeout ID of the `ResizeObserver`, used to clear the timeout.
	 * 
	 * @type {?Number}
	 */
	let resizeTimeoutId;

	/**
	 * Animation request ID, used to interrupt the loop.
	 * 
	 * @type {?Number}
	 */
	let animationRequestId;

	/** @todo Replace by Set or Map */
	let mouseEnterListeners = [],
		mouseEnterListenerCount = 0,
		mouseLeaveListeners = [],
		mouseLeaveListenerCount = 0,
		mouseDownListeners = [],
		mouseDownListenerCount = 0;

	/**
	 * @private
	 * @type {WebGLRenderer}
	 */
	const outputRenderer = new WebGLRenderer({offscreen: false});

	/** @type {?Number} */
	let rendererLength;

	/**
	 * Offscreen renderers.
	 * 
	 * @type {Composites[]}
	 */
	this.renderers = [];

	/**
	 * Textures for each offscreen renderer.
	 * 
	 * @type {WebGLTexture[]}
	 */
	this.rendererTextures = [];

	/** @returns {String} */
	this.getFontPath = () => fontPath;

	/** @returns {String} */
	this.getShaderPath = () => shaderPath;

	/** @returns {String} */
	this.getTexturePath = () => texturePath;

	/** @type {Vector2} */
	const viewport = new Vector2();

	/**
	 * @returns {Vector2}
	 */
	this.getViewport = () => viewport;

	/**
	 * Current GUI scale multiplier.
	 * Determines the scale of the crosshair and most of the GUI components.
	 * 
	 * @type {?Number}
	 */
	this.currentScale = 2;

	/**
	 * GUI scale multiplier chosen by the user.
	 * 
	 * @type {?Number}
	 */
	this.desiredScale = 2;

	/**
	 * Maximum GUI scale multiplier appliable to the current viewport.
	 * This caps the desired scale multiplier.
	 * 
	 * @type {?Number}
	 */
	this.maxScale = 2;

	/**
	 * Current position of the pointer, used for GUI event listeners.
	 * 
	 * @type {Vector2}
	 */
	let pointerPosition = new Vector2(0, 0);

	this.build = function() {
		outputRenderer.build();
		viewport.set([innerWidth, innerHeight]);
		viewport.multiplyScalar(devicePixelRatio).floor();
		outputRenderer.setViewport(viewport);

		this.resizeObserver = new ResizeObserver(([entry]) => {
			// Avoid the first resize
			if (isFirstResize) return isFirstResize = null;

			clearTimeout(resizeTimeoutId);
			resizeTimeoutId = setTimeout(() => {
				let width, height, dpr = 1;

				if (entry.devicePixelContentBoxSize) {
					({inlineSize: width, blockSize: height} = entry.devicePixelContentBoxSize[0]);
				} else {
					dpr = devicePixelRatio;

					if (entry.contentBoxSize) {
						entry.contentBoxSize[0] ?
							({inlineSize: width, blockSize: height} = entry.contentBoxSize[0]) :
							({inlineSize: width, blockSize: height} = entry.contentBoxSize);
					} else ({width, height} = entry.contentRect);
				}

				this.resize(width, height, dpr);
			}, RESIZE_DELAY);
		});

		const canvas = outputRenderer.getCanvas();

		document.body.appendChild(canvas);

		try {
			this.resizeObserver.observe(canvas, {box: "device-pixel-content-box"});
		} catch (error) {
			// If "device-pixel-content-box" isn't defined, try with "content-box"
			this.resizeObserver.observe(canvas, {box: "content-box"});
		}

		canvas.onmousedown = mouseDownListener;
		canvas.onmousemove = ({clientX: x, clientY: y}) => {
			pointerPosition = new Vector2(x, y).multiplyScalar(devicePixelRatio).divideScalar(this.currentScale);

			mouseMoveListener();
		};
	};

	/**
	 * Setups the instance renderer managers.
	 * 
	 * @param {Composite[]} composites
	 */
	this.setupRenderers = async function(composites) {
		const {rendererTextures} = this;
		rendererLength = composites.length;

		for (let i = 0, composite, renderer; i < rendererLength; i++) {
			composite = composites[i];
			renderer = composite.getRenderer();
			renderer.build();
			renderer.setViewport(viewport);

			await composite.build();

			this.renderers.push(composite);
			rendererTextures.push(this.createOutputTexture());
		}
	};

	/**
	 * Creates an output `WebGLTexture` for a new renderer.
	 * 
	 * @returns {WebGLTexture}
	 */
	this.createOutputTexture = function() {
		const gl = outputRenderer.getContext();
		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // No mipmaps

		return texture;
	};

	/**
	 * When called, recalculates the max possible GUI scale for the current viewport dimensions
	 * Clamps up the desired scale to the max scale to get the current scale
	 * 
	 * @param {Number} width
	 * @param {Number} height
	 * @param {Number} dpr
	 */
	this.resize = function(width, height, dpr) {
		{
			/** @type {Vector2} */
			const newViewport = new Vector2(width, height)
				.multiplyScalar(dpr)
				.floor();

			viewport.set(newViewport);
			outputRenderer.setViewport(viewport);
		}

		// Calculate scale multiplier
		let i = 1;
		while (
			viewport[0] > DEFAULT_WIDTH * dpr * i &&
			viewport[1] > DEFAULT_HEIGHT * dpr * i
		) i++;

		this.currentScale = clampUp(this.desiredScale, this.maxScale = clampDown(i - 1, 1));

		for (i = 0; i < rendererLength; i++) this.renderers[i].resize(viewport);
	};

	/**
	 * @param {Number} index
	 * @param {OffscreenCanvas} canvas
	 */
	this.updateRendererTexture = function(index, canvas) {
		const gl = outputRenderer.getContext();

		gl.bindTexture(gl.TEXTURE_2D, this.rendererTextures[index]);

		/** @todo Replace by `texStorage2D` (lower memory costs in some implementations, according to {@link https://registry.khronos.org/webgl/specs/latest/2.0/#3.7.6}) */
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, canvas);
	};

	/** @todo Find a better name */
	this.startLoop = () => this.loop();

	this.loop = function() {
		animationRequestId = requestAnimationFrame(this.loop);

		this.render();
	}.bind(this);

	/** @todo Find a better name */
	this.stopLoop = function() {
		cancelAnimationFrame(animationRequestId);

		animationRequestId = null;
	};

	this.initialize = async function() {
		const gl = outputRenderer.getContext();

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		/** @type {Program} */
		const program = await outputRenderer.loadProgram(
			"main.vert",
			"main.frag",
			this.getShaderPath(),
		);

		outputRenderer.linkProgram(program);

		gl.useProgram(program.getProgram());

		gl.attribute = {position: 0};
		gl.buffer = {position: gl.createBuffer()};

		gl.enableVertexAttribArray(gl.attribute.position);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.position);
		gl.vertexAttribPointer(gl.attribute.position, 2, gl.FLOAT, false, 0, 0);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, -1, 1, -1, -1, 1, -1]), gl.STATIC_DRAW);
	};

	/**
	 * @todo Use instanced drawing with a texture array
	 */
	this.render = function() {
		const {rendererTextures} = this;
		const gl = outputRenderer.getContext();

		for (let i = 0; i < rendererLength; i++) {
			if (this.renderers[i].disabled) continue;

			gl.bindTexture(gl.TEXTURE_2D, rendererTextures[i]);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		}
	};

	this.dispose = function() {
		/** @type {?WebGL2RenderingContext} */
		const gl = outputRenderer.getContext();

		if (gl === null) return console.log("This exception occurred before building the instance.");

		this.stopLoop();

		for (let i = 0; i < rendererLength; i++) this.renderers[i].dispose();

		this.resizeObserver.unobserve(outputRenderer.getCanvas());

		outputRenderer.dispose();

		console.log("The instance was properly disposed after catching this exception.");
	};

	this.addMouseDownListener = function(listener) {
		mouseDownListeners.push(listener);
		mouseDownListenerCount++;
	};

	this.addMouseEnterListener = function(listener) {
		mouseEnterListeners.push(listener);
		mouseEnterListenerCount++;
	};

	this.addMouseLeaveListener = function(listener) {
		mouseLeaveListeners.push(listener);
		mouseLeaveListenerCount++;
	};

	this.removeMouseDownListener = function(listener) {
		mouseDownListeners.splice(mouseDownListeners.indexOf(listener), 1);
		mouseDownListenerCount--;
	};

	this.removeMouseEnterListener = function(listener) {
		mouseEnterListeners.splice(mouseEnterListeners.indexOf(listener), 1);
		mouseEnterListenerCount--;
	};

	this.removeMouseLeaveListener = function(listener) {
		mouseLeaveListeners.splice(mouseLeaveListeners.indexOf(listener), 1);
		mouseLeaveListenerCount--;
	};

	/**
	 * Note: Because listeners may push a new layer
	 * (thus modifying the listener array by discarding the previous ones),
	 * the loop will break if a listener is called.
	 */
	function mouseDownListener() {
		for (let i = 0, l = mouseDownListenerCount, listener; i < l; i++) {
			listener = mouseDownListeners[i];

			if (!intersects(pointerPosition, listener.component.getPosition(), listener.component.getSize())) continue;

			listener(pointerPosition);

			break;
		}
	}

	function mouseMoveListener() {
		let i, l, listener;

		for (i = 0, l = mouseEnterListenerCount; i < l; i++) {
			listener = mouseEnterListeners[i];

			if (!intersects(pointerPosition, listener.component.getPosition(), listener.component.getSize())) continue;
			if (listener.component.getIsHovered()) continue;

			listener.component.setIsHovered(true);
			listener(pointerPosition);
		}

		for (i = 0, l = mouseLeaveListenerCount; i < l; i++) {
			listener = mouseLeaveListeners[i];

			if (intersects(pointerPosition, listener.component.getPosition(), listener.component.getSize())) continue;
			if (!listener.component.getIsHovered()) continue;

			listener.component.setIsHovered(false);
			listener(pointerPosition);
		}
	}
}