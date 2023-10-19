import {Layer} from "./index.js";
import {Component, ReactiveComponent, StructuralComponent, VisualComponent} from "./components/index.js";
import {Composite} from "../index.js";
import {Camera, OrthographicCamera} from "../cameras/index.js";
import {Matrix3, Vector2} from "../math/index.js";
import {Font} from "../fonts/index.js";
import {Texture} from "../wrappers/index.js";

/**
 * @todo Clear queue?
 */
export class GUIComposite extends Composite {
	/**
	 * @type {Camera}
	 */
	#camera;

	/**
	 * @type {Number}
	 */
	#subcomponentCount;

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
	 * @type {ReactiveComponent[]}
	 */
	#reactiveComponents;

	/**
	 * Children of currently built layers.
	 * 
	 * @type {Component[]}
	 */
	#tree;

	/**
	 * Components registered for the next render.
	 * 
	 * @type {Component[]}
	 */
	#renderQueue;

	/**
	 * @type {Number[]}
	 */
	#lastInsertionIndices;

	/**
	 * @type {Object.<String, Font>}
	 */
	#fonts;

	/**
	 * @param {Object} options
	 * @param {Object.<String, Font>} options.fonts
	 */
	constructor({fonts}) {
		super(arguments[0]);

		this.setAnimatable(true);

		this.#camera = new OrthographicCamera(this.getInstance().getRenderer().getViewport());
		this.#subcomponentCount = 0;
		this.#layerStack = [];
		this.#rootComponents = [];
		this.#animatedComponents = [];
		this.#reactiveComponents = [];
		this.#tree = [];
		this.#renderQueue = [];
		this.#lastInsertionIndices = [];
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
	 * @returns {Texture}
	 * @throws {ReferenceError}
	 */
	getTexture(key) {
		if (!(key in this.getRenderer().getUserTextures())) {
			throw new ReferenceError(`Undefined texture key "${key}".`);
		}

		return this.getRenderer().getUserTextures()[key];
	}

	/**
	 * @inheritdoc
	 */
	async build() {
		const glyphMapPath = this.getInstance().getParameter("font_path");

		for (let key in this.#fonts) {
			await this.#fonts[key].loadGlyphMap(glyphMapPath);
		}

		const scale = this.getInstance().getParameter("current_scale");

		this.#camera.setProjection(
			Matrix3
				.orthographic(this.getInstance().getRenderer().getViewport())
				.multiply(Matrix3.scale(new Vector2(scale, scale))),
		);

		await this.getRenderer().build(
			this.getInstance().getParameter("shader_path"),
			this.#camera.getProjection(),
		);
	}

	/**
	 * Populates recursively the component tree.
	 * 
	 * @param {Component[]} children
	 * @param {Object} options
	 * @param {Boolean} [options.addListeners=false]
	 * @param {Boolean} [options.addToTree=false]
	 */
	addChildrenToRenderQueue(children, {addListeners = false, addToTree = false}) {
		for (let i = 0, l = children.length, component; i < l; i++) {
			component = children[i];

			if (!(component instanceof StructuralComponent)) {
				this.#renderQueue.push(component);
				this.#subcomponentCount += component.getSubcomponents().length;

				this.#animatedComponents.push(component);

				if (component instanceof ReactiveComponent) {
					this.#reactiveComponents.push(component);

					if (addListeners) {
						this.addListeners(component);
					}
				}

				if (addToTree) {
					this.#tree.push(component);
				}

				continue;
			}

			this.addChildrenToRenderQueue(component.getChildren(), {addListeners, addToTree});
		}
	}

	/**
	 * Initializes the event listeners for the provided component.
	 * 
	 * @param {ReactiveComponent} component
	 */
	addListeners(component) {
		let listener;

		if ((listener = component.getOnMouseDown()) !== null) this.getInstance().addListener("mouse_down", listener);
		if ((listener = component.getOnMouseEnter()) !== null) this.getInstance().addListener("mouse_enter", listener);
		if ((listener = component.getOnMouseLeave()) !== null) this.getInstance().addListener("mouse_leave", listener);
	}

	/**
	 * Discards event listeners for the provided components.
	 * 
	 * @param {Component[]} components
	 */
	removeListeners(components) {
		for (let i = 0, l = components.length, component, listener; i < l; i++) {
			if (!(components[i] instanceof ReactiveComponent)) continue;

			component = components[i];

			if ((listener = component.getOnMouseDown()) !== null) this.getInstance().removeListener("mouse_down", listener);
			if ((listener = component.getOnMouseEnter()) !== null) this.getInstance().removeListener("mouse_enter", listener);
			if ((listener = component.getOnMouseLeave()) !== null) this.getInstance().removeListener("mouse_leave", listener);
		}
	}

	/**
	 * Computes the absolute position for each component of the render queue,
	 * all layers included.
	 * 
	 * @returns {this}
	 */
	compute() {
		/**
		 * @todo Create the viewport in the instance instead of there
		 */
		const parentSize = this
			.getInstance()
			.getRenderer()
			.getViewport()
			.clone()
			.divideScalar(this.getInstance().getParameter("current_scale"));

		for (let i = 0, l = this.#rootComponents.length; i < l; i++) {
			this.#rootComponents[i].compute(new Vector2(), parentSize.clone());
		}

		return this;
	}

	/**
	 * @inheritdoc
	 */
	update(frameIndex) {
		for (let i = 0, length = this.#animatedComponents.length, component; i < length; i++) {
			component = this.#animatedComponents[i];

			if (!component.update(this, frameIndex)) {
				continue;
			}

			this.pushToRenderQueue(component);
		}

		if (this.#renderQueue.length === 0) {
			return;
		}

		this.render();
	}

	/**
	 * @inheritdoc
	 */
	render() {
		// console.debug(`render(): ${this.#renderQueue.length} (${this.#subcomponentCount}) in queue`);

		this.getRenderer().render(this.#renderQueue, this.#subcomponentCount);

		this.#renderQueue.length = 0;
		this.#subcomponentCount = 0;

		/**
		 * @todo Move updateCompositeTexture() to the instance itself
		 */
		this.getInstance().getRenderer().updateCompositeTexture(
			this.getIndex(),
			this.getRenderer().getCanvas(),
		);
	}

	/**
	 * Resizes the viewport of the renderer and triggers a new render.
	 * NOTE: Resize events render ALL the components from the layer stack.
	 * 
	 * @inheritdoc
	 */
	resize(viewport) {
		const scale = this.getInstance().getParameter("current_scale");

		/**
		 * @todo Replace by OrthographicCamera.updateProjection
		 */
		this.#camera.setProjection(
			Matrix3
				.orthographic(viewport)
				.multiply(Matrix3.scale(new Vector2(scale, scale))),
		);

		this.getRenderer().resize(viewport, this.#camera.getProjection());
		this.#subcomponentCount = 0;

		// Add all components to the render queue
		for (let i = 0, l = this.#tree.length, component; i < l; i++) {
			component = this.#tree[i];

			if (component instanceof StructuralComponent) {
				this.addChildrenToRenderQueue(component.getChildren(), {
					addListeners: false,
					addToTree: false,
				});

				continue;
			}

			this.#renderQueue.push(component);
			this.#subcomponentCount += component.getSubcomponents().length;
		}

		this.compute().render();
	}

	/**
	 * Adds a new layer on top of the layer stack.
	 * Calling this method will result in all the children of the new layer
	 * being registered into the render queue.
	 * The new components will be rendered on top of the previous ones.
	 * 
	 * @param {Layer} layer
	 */
	push(layer) {
		this.#layerStack.push(layer);

		// Discard event listeners of `ReactiveComponent` instances in the previous layers
		this.removeListeners(this.#reactiveComponents);

		this.#subcomponentCount = 0;
		this.#animatedComponents.length = 0;
		this.#reactiveComponents.length = 0;

		// Mark the tree length as the extraction index for this layer
		this.#lastInsertionIndices.push(this.#tree.length);

		/**
		 * @todo Layer.build() should return a single root component
		 */
		const builtComponents = layer.build(this);
		this.#rootComponents.push(...builtComponents);

		this.addChildrenToRenderQueue(builtComponents, {
			addListeners: true,
			addToTree: true,
		});

		this.compute().render();
	}

	/**
	 * @todo Render queue unique check
	 * 
	 * Registers the component in the render queue.
	 * 
	 * @param {Component} component
	 * @returns {this}
	 */
	pushToRenderQueue(component) {
		if (component instanceof StructuralComponent) {
			const children = component.getChildren();

			for (let i = 0, l = children.length; i < l; i++) {
				this.pushToRenderQueue(children[i]);
			}

			return this;
		}

		this.#renderQueue.push(component);
		this.#subcomponentCount += component.getSubcomponents().length;

		return this;
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

		this.removeListeners(this.#reactiveComponents);

		// Truncate the tree (remove the components from the popped layer)
		this.#tree.length = this.#lastInsertionIndices.pop();

		this.#renderQueue.length = 0;
		this.#subcomponentCount = 0;
		this.#animatedComponents.length = 0;
		this.#reactiveComponents.length = 0;

		if (this.#layerStack.length === 1) {
			this.#rootComponents.length = 0;

			this.getRenderer().clear();

			return;
		}

		this.addChildrenToRenderQueue(this.#tree, {
			addListeners: true,
			addToTree: false,
		});

		this.getRenderer().clear();

		this.compute().render();
	}
}