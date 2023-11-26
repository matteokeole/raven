import {GUIRenderer, Layer} from "./index.js";
import {Component, StructuralComponent, VisualComponent} from "./Component/index.js";
import {Event, MouseDownEvent, MouseMoveEvent} from "./Event/index.js";
import {Composite, Instance} from "../index.js";
import {Camera, OrthographicCamera} from "../cameras/index.js";
import {Font} from "../fonts/index.js";
import {Matrix3, Vector2, intersects} from "../math/index.js";
import {BucketQueue} from "../Queue/index.js";
import {GUIScene} from "../Scene/index.js";
import {TextureContainer} from "../wrappers/index.js";

export class GUIComposite extends Composite {
	/**
	 * @type {Camera}
	 */
	#camera;

	/**
	 * @type {Layer[]}
	 */
	#layerStack;

	/**
	 * @type {Component[]}
	 */
	#rootComponents;

	/**
	 * @type {VisualComponent[]}
	 */
	#animatedComponents;

	/**
	 * Children of currently built layers.
	 * 
	 * @type {Component[]}
	 */
	#tree;

	/**
	 * @type {Number[]}
	 */
	#lastInsertionIndices;

	/**
	 * @type {Record.<String, BucketQueue.<Function>>}
	 */
	#eventListeners;

	/**
	 * @type {Record.<String, Font>}
	 */
	#fonts;

	/**
	 * @param {Object} options
	 * @param {GUIRenderer} options.renderer
	 * @param {Instance} options.instance
	 * @param {Record.<String, Font>} options.fonts
	 */
	constructor({renderer, instance, fonts}) {
		super({renderer, instance});

		this._renderer = renderer;

		// This contains the visual components registered for the next render
		this._scene = new GUIScene();

		this.setAnimatable(true);

		const instanceViewport = this.getInstance().getRenderer().getViewport();

		this.#camera = new OrthographicCamera(new Vector2(instanceViewport[2], instanceViewport[3]));
		this.#layerStack = [];
		this.#rootComponents = [];
		this.#animatedComponents = [];
		this.#tree = [];
		this.#lastInsertionIndices = [];
		this.#eventListeners = {};
		this.#fonts = fonts;
	}

	/**
	 * @param {String} key
	 * @returns {Font}
	 * @throws {ReferenceError}
	 */
	getFont(key) {
		if (!(key in this.#fonts)) {
			throw new ReferenceError(`Undefined font key "${key}".`);
		}

		return this.#fonts[key];
	}

	/**
	 * @param {String} key
	 * @returns {TextureContainer}
	 * @throws {ReferenceError}
	 */
	getTexture(key) {
		if (!(key in this._renderer.getTextures())) {
			throw new ReferenceError(`Undefined texture key "${key}".`);
		}

		return this._renderer.getTextures()[key];
	}

	async build() {
		const glyphMapPath = this.getInstance().getParameter("font_path");

		for (let key in this.#fonts) {
			await this.#fonts[key].loadGlyphMap(glyphMapPath);
		}

		const viewport = new Vector2(
			this.getInstance().getRenderer().getViewport()[2],
			this.getInstance().getRenderer().getViewport()[3],
		);
		const scale = this.getInstance().getParameter("current_scale");
		const projection = Matrix3
			.orthographic(viewport)
			.multiply(Matrix3.scale(new Vector2(scale, scale)));

		this._renderer.setShaderPath(this.getInstance().getParameter("shader_path"));
		this._renderer.setProjection(projection);
		this.#camera.setProjection(projection);

		await this._renderer.build();
	}

	/**
	 * Computes the absolute position for each component of the render queue,
	 * all layers included.
	 */
	compute() {
		const instanceViewport = this
			.getInstance()
			.getRenderer()
			.getViewport();

		/**
		 * @todo Create the viewport in the instance instead of there
		 */
		const parentSize = new Vector2(instanceViewport[2], instanceViewport[3])
			.divideScalar(this.getInstance().getParameter("current_scale"));

		for (let i = 0, l = this.#rootComponents.length; i < l; i++) {
			this.#rootComponents[i].compute(new Vector2(), parentSize.clone());
		}
	}

	update(frameIndex) {
		for (let i = 0, length = this.#animatedComponents.length, component; i < length; i++) {
			component = this.#animatedComponents[i];

			if (!component.update(this, frameIndex)) {
				continue;
			}

			this.pushToRenderQueue(component);
		}

		if (this._scene.isEmpty()) {
			return;
		}

		this.render();
	}

	render() {
		// console.debug(`render(): ${this._scene.getQueue().length} (${this._scene.getSubcomponentCount()}) in queue`);

		this._renderer.render(this._scene);

		/**
		 * @todo Rename "scene" by "render queue"?
		 */
		this._scene.clear();

		/**
		 * @todo Move updateCompositeTexture() to the instance/instance renderer
		 */
		this.getInstance().getRenderer().updateCompositeTexture(
			this.getIndex(),
			this._renderer.getCanvas(),
		);
	}

	/**
	 * Resizes the viewport of the renderer and triggers a new render.
	 * NOTE: Resize events render ALL the components from the layer stack.
	 */
	resize(viewport) {
		super.resize(viewport);

		const scale = this.getInstance().getParameter("current_scale");

		/**
		 * @todo Replace by OrthographicCamera.updateProjection
		 */
		this.#camera.setProjection(
			Matrix3
				.orthographic(new Vector2(viewport[2], viewport[3]))
				.multiply(Matrix3.scale(new Vector2(scale, scale))),
		);

		this._renderer.resize(viewport, this.#camera.getProjection());

		// Add all components to the render queue
		for (let i = 0, l = this.#tree.length, component; i < l; i++) {
			component = this.#tree[i];

			if (component instanceof StructuralComponent) {
				this.#addChildrenToRenderQueue(component.getChildren(), false);

				continue;
			}

			this._scene.add(component);
		}

		this.compute();
		this.render();
	}

	/**
	 * Adds a new layer on top of the layer stack.
	 * Calling this method will result in all the children of the new layer
	 * being registered into the render queue.
	 * The new components will be rendered on top of the previous ones.
	 * 
	 * @param {Layer} layer
	 * @throws {Error} if the layer didn't return a component
	 */
	push(layer) {
		this.#layerStack.push(layer);


		this._scene.resetSubcomponentCount();
		this.#animatedComponents.length = 0;

		// Mark the tree length as the extraction index for this layer
		this.#lastInsertionIndices.push(this.#tree.length);

		const rootComponent = this.#buildLayer(layer);

		this.#rootComponents.push(rootComponent);
		this.#addChildrenToRenderQueue([rootComponent], true);
		this.#sealEventListenerBuckets();

		this.compute();
		this.render();
	}

	/**
	 * @todo Render queue unique check
	 * 
	 * Registers the component in the render queue.
	 * 
	 * @param {Component} component
	 */
	pushToRenderQueue(component) {
		if (component instanceof StructuralComponent) {
			const children = component.getChildren();

			for (let i = 0, l = children.length; i < l; i++) {
				this.pushToRenderQueue(children[i]);
			}

			return;
		}

		this._scene.add(component);
	}

	/**
	 * @param {Event} event
	 */
	dispatchEvent(event) {
		// @ts-ignore
		const eventName = event.constructor.NAME;

		if (!(eventName in this.#eventListeners)) {
			return;
		}

		const carry = event.getCarry();
		const eventListeners = this.#eventListeners[eventName];

		for (let i = 0, length = eventListeners.length; i < length; i++) {
			eventListeners[i](carry, this);
		}
	}

	/**
	 * Removes the last layer from the layer stack.
	 * Calling this method will result in all the children of all the stacked layers
	 * being registered into the render queue.
	 * 
	 * @throws {Error}
	 */
	pop() {
		if (this.#layerStack.length === 0) {
			throw new Error("Could not pop: no layers registered.");
		}

		this.#popEventListenerBucket();

		/**
		 * @todo Also truncate the root components?
		 * 
		 * Truncate the tree (remove the components from the popped layer)
		 */
		this.#tree.length = this.#lastInsertionIndices.pop();

		this._scene.clear();
		this.#animatedComponents.length = 0;

		if (this.#layerStack.length === 1) {
			this.#rootComponents.length = 0;

			this._renderer.clear();

			return;
		}

		this.#addChildrenToRenderQueue(this.#tree, false);

		this._renderer.clear();

		this.compute();
		this.render();
	}

	/**
	 * @param {MouseEvent} event
	 */
	onMouseDown(event) {
		this.dispatchEvent(new MouseDownEvent(new Vector2(event.clientX, event.clientY)));
	}

	/**
	 * @param {MouseEvent} event
	 */
	onMouseMove(event) {
		this.dispatchEvent(new MouseMoveEvent(new Vector2(event.clientX, event.clientY)));
	}

	/**
	 * Populates recursively the component tree.
	 * 
	 * @param {Component[]} children
	 * @param {Object} options
	 * @param {Boolean} [options.addListeners]
	 * @param {Boolean} [options.addToTree]
	 */
	#addChildrenToRenderQueue(children, addToTree = false) {
		for (let i = 0, l = children.length, component; i < l; i++) {
			component = children[i];
			component.setEventDispatcher(this);

			this.#pushEventListeners(component);

			if (!(component instanceof StructuralComponent)) {
				this._scene.add(component);
				this.#animatedComponents.push(component);

				if (addToTree) {
					this.#tree.push(component);
				}

				continue;
			}

			this.#addChildrenToRenderQueue(component.getChildren(), addToTree);
		}
	}

	/**
	 * @param {Component} component
	 */
	#pushEventListeners(component) {
		const events = component.getEvents();

		for (let i = 0, length = events.length, eventName, eventListener; i < length; i++) {
			eventName = events[i];

			if (typeof component[eventName] !== "function") {
				throw new Error(`Event listener not found for event "${eventName}" in ${component.constructor.name} instance`);
			}

			if (!(eventName in this.#eventListeners)) {
				this.#eventListeners[eventName] = new BucketQueue();
			}

			eventListener = component[eventName].bind(component);

			/**
			 * @todo Refactor
			 */
			if ([MouseDownEvent.NAME, MouseMoveEvent.NAME].includes(eventName)) {
				eventListener = this.#createMouseEventListener(component, eventListener);
			}

			this.#eventListeners[eventName].push(eventListener);
		}
	}

	/**
	 * @param {Component} component
	 * @param {Function} eventListener
	 */
	#createMouseEventListener(component, eventListener) {
		/**
		 * @param {Vector2} carry
		 * @param {GUIComposite} context
		 */
		return function(carry, context) {
			if (!intersects(carry, component.getPosition(), component.getSize())) {
				return;
			}

			eventListener(carry, context);
		};
	}

	/**
	 * @todo Find a way to remove the `Object.values` call
	 */
	#sealEventListenerBuckets() {
		/**
		 * @type {BucketQueue[]}
		 */
		const eventListenerQueues = Object.values(this.#eventListeners);

		for (let i = 0, length = eventListenerQueues.length; i < length; i++) {
			eventListenerQueues[i].sealBucket();
		}
	}

	/**
	 * @todo Find a way to remove the `Object.values` call
	 */
	#popEventListenerBucket() {
		/**
		 * @type {BucketQueue[]}
		 */
		const eventListenerQueues = Object.values(this.#eventListeners);

		for (let i = 0, length = eventListenerQueues.length; i < length; i++) {
			eventListenerQueues[i].popBucket();
		}
	}

	/**
	 * @param {Layer} layer
	 * @throws {Error} if the layer did not return a component
	 */
	#buildLayer(layer) {
		const rootComponent = layer.build(this);

		if (!(rootComponent instanceof Component)) {
			throw new Error(`Could not build ${layer.constructor.name}: the layer did not return a component.`);
		}

		return rootComponent;
	}
}