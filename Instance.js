import {Vector2, clampDown, clampUp, intersects} from "./math/index.js";
import {Program} from "./wrappers/index.js";
import {RendererManager} from "./RendererManager.js";
import {WebGLRenderer} from "./WebGLRenderer.js";

/**
 * @todo Find a better name
 * @todo Implement render pipeline here
 * @todo Apply settings
 * 
 * Game instance.
 * This holds information about asset base paths, viewport dimensions and GUI scale.
 * 
 * @param {{
 *    shaderPath: String,
 *    texturePath: String,
 * }}
 */
export function Instance({shaderPath, texturePath}) {
	const DEFAULT_WIDTH = 320;
	const DEFAULT_HEIGHT = 240;
	const RESIZE_DELAY = 50;

	/**
	 * Prevents the first `ResizeObserver` call.
	 * 
	 * @type {?Boolean}
	 */
	let isFirstResize = true;

	/**
	 * Timeout ID of the `ResizeObserver`, used to clear the timeout.
	 * 
	 * @type {Number}
	 */
	let resizeTimeoutID;

	/**
	 * Animation request ID, used to interrupt the loop.
	 * 
	 * @type {Number}
	 */
	let animationRequestID;

	/**
	 * Returns `true` if the instance canvas has been added to the DOM, `false` otherwise.
	 * 
	 * @type {Boolean}
	 */
	let hasBeenBuilt = false;

	let rendererLength;

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
	const outputRenderer = new WebGLRenderer({
		offscreen: false,
		generateMipmaps: false,
	});

	/**
	 * Offscreen renderers.
	 * 
	 * @type {RendererManagers[]}
	 */
	this.renderers = [];

	/**
	 * Textures for each offscreen renderer.
	 * 
	 * @type {WebGLTexture[]}
	 */
	this.rendererTextures = [];

	/** @returns {String} */
	this.getShaderPath = () => shaderPath;

	/** @returns {String} */
	this.getTexturePath = () => texturePath;

	/**
	 * Cached values of `window.innerWidth` and `window.innerHeight`.
	 * 
	 * @type {Vector2}
	 */
	let viewport = new Vector2(0, 0);

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
	 * @todo Since this is controlled by the user, move it to a public class?
	 * 
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
	this.maxScale = 4;

	/**
	 * Current position of the pointer, used for GUI event listeners.
	 * 
	 * @type {Vector2}
	 */
	let pointerPosition = new Vector2(0, 0);

	/**
	 * @throws {NoWebGL2Error}
	 */
	this.build = function() {
		outputRenderer.build();
		const dpr = devicePixelRatio;
		viewport.x = innerWidth * dpr;
		viewport.y = innerHeight * dpr;
		viewport = viewport.floor32();
		outputRenderer.setViewport(viewport);

		this.resizeObserver = new ResizeObserver(([entry]) => {
			// Avoid the first resize
			if (isFirstResize) return isFirstResize = null;

			clearTimeout(resizeTimeoutID);
			resizeTimeoutID = setTimeout(() => {
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

		document.body.appendChild(outputRenderer.getCanvas());

		hasBeenBuilt = true;

		try {
			this.resizeObserver.observe(outputRenderer.getCanvas(), {
				box: "device-pixel-content-box",
			});
		} catch (error) {
			// "device-pixel-content-box" isn't defined, try with "content-box"
			this.resizeObserver.observe(outputRenderer.getCanvas(), {
				box: "content-box",
			});
		}

		outputRenderer.getCanvas().addEventListener("mousemove", mouseMoveListener.bind(this));
		outputRenderer.getCanvas().addEventListener("mousedown", mouseDownListener.bind(this));
	};

	this.hasBeenBuilt = () => hasBeenBuilt;

	/**
	 * Setups the instance renderer managers.
	 * 
	 * @param {RendererManager[]} rendererManagers
	 */
	this.setupRenderers = async function(rendererManagers) {
		const {rendererTextures} = this;
		rendererLength = rendererManagers.length;

		for (let i = 0, rendererManager, renderer; i < rendererLength; i++) {
			rendererManager = rendererManagers[i];
			({renderer} = rendererManager);

			renderer.build();
			renderer.setViewport(viewport);
			await rendererManager.init();

			this.renderers.push(rendererManager);
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
		let texture = gl.createTexture();

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
		/** @type {Vector2} */
		let newViewport = outputRenderer.setViewport(new Vector2(width, height).multiplyScalar(dpr).floor32());
		viewport.x = newViewport.x;
		viewport.y = newViewport.y;
		newViewport = null;

		// Calculate scale multiplier
		let i = 1;
		while (
			viewport.x > DEFAULT_WIDTH * dpr * i &&
			viewport.y > DEFAULT_HEIGHT * dpr * i
		) i++;

		const currentScale = clampUp(
			this.desiredScale,
			this.maxScale = clampDown(i - 1, 1),
		);

		this.currentScale = currentScale;

		for (let i = 0; i < rendererLength; i++) this.renderers[i].resize(viewport);
	};

	/**
	 * @todo Which color format?
	 * 
	 * @param {Number} index
	 * @param {OffscreenCanvas} canvas
	 */
	this.updateRendererTexture = function(index, canvas) {
		const gl = outputRenderer.getContext();

		gl.bindTexture(gl.TEXTURE_2D, this.rendererTextures[index]);
		
		/** @todo Replace by `texStorage2D` (lower memory costs in some implementations, according to {@link https://registry.khronos.org/webgl/specs/latest/2.0/#3.7.6}) */
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
	};

	/**
	 * @todo Better naming
	 * 
	 * Starts the game loop.
	 */
	this.startLoop = () => this.loop();

	/**
	 * @todo Better naming
	 * 
	 * Game loop.
	 */
	this.loop = function() {
		animationRequestID = requestAnimationFrame(this.loop);

		this.render();
	}.bind(this);

	/**
	 * @todo Better naming
	 * 
	 * Stops the game loop.
	 */
	this.stopLoop = () => cancelAnimationFrame(animationRequestID);

	/**
	 * @todo Use `Renderer` class to avoid duplicate methods (createProgram/createShader/linkProgram)?
	 */
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

		/** @todo Make useProgram helper in `WebGLRenderer`? */
		gl.useProgram(program.getProgram());

		gl.attribute = {
			position: 0,
		};
		gl.buffer = {
			position: gl.createBuffer(),
		};
		gl.uniform = {};

		gl.enableVertexAttribArray(gl.attribute.position);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffer.position);
		gl.vertexAttribPointer(gl.attribute.position, 2, gl.FLOAT, false, 0, 0);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			1,  1,
		   -1,  1,
		   -1, -1,
			1, -1,
		]), gl.STATIC_DRAW);
	};

	/**
	 * @todo Use instanced drawing
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
		const gl = outputRenderer.getContext();

		if (gl === null) return console.info("This exception occurred before building the instance.");

		/** @todo Stop the game loop if it has started */

		// Dispose child renderers
		for (let i = 0; i < rendererLength; i++) this.renderers[i].dispose();

		// Remove the resize observer
		this.resizeObserver.unobserve(outputRenderer.canvas);

		outputRenderer.dispose();

		return console.info("The instance was properly disposed after catching this exception.");
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
	 * Manager for the `mouseenter` and `mouseleave` events.
	 * 
	 * @param {{x: Number, y: Number}}
	 */
	function mouseMoveListener({clientX: x, clientY: y}) {
		pointerPosition = new Vector2(x, y).multiplyScalar(devicePixelRatio).divideScalar(this.currentScale);
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

	/**
	 * Manager for the `mousedown` event.
	 */
	function mouseDownListener() {
		for (let i = 0, l = mouseDownListenerCount, listener; i < l; i++) {
			listener = mouseDownListeners[i];

			if (!intersects(pointerPosition, listener.component.getPosition(), listener.component.getSize())) continue;

			listener(pointerPosition);
		}
	}
}