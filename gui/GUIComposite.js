import {GUIRenderer, Layer} from "./index.js";
import {Component, ReactiveComponent, StructuralComponent, VisualComponent} from "./components/index.js";
import {Composite, Instance} from "../index.js";
import {Camera, OrthographicCamera} from "../cameras/index.js";
import {Font} from "../fonts/index.js";
import {Matrix3, Vector2} from "../math/index.js";
import {TextureContainer} from "../wrappers/index.js";
import {GUIScene} from "../Scene/index.js";

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
	 * @type {Number[]}
	 */
	#lastInsertionIndices;

	/**
	 * @type {Object.<String, Font>}
	 */
	#fonts;

	/**
	 * @param {Object} options
	 * @param {GUIRenderer} options.renderer
	 * @param {Instance} options.instance
	 * @param {Object.<String, Font>} options.fonts
	 */
	constructor({renderer, instance, fonts}) {
		super({renderer, instance});

		this._renderer = renderer;

		// This contains the visual components registered for the next render
		this._scene = new GUIScene();

		this.setAnimatable(true);

		this.#camera = new OrthographicCamera(this.getInstance().getRenderer().getViewport());
		this.#layerStack = [];
		this.#rootComponents = [];
		this.#animatedComponents = [];
		this.#reactiveComponents = [];
		this.#tree = [];
		this.#lastInsertionIndices = [];
		this.#fonts = fonts;
	}

	/**
	 * @returns {GUIRenderer}
	 */
	getRenderer() {
		return this._renderer;
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
		if (!(key in this.getRenderer().getTextures())) {
			throw new ReferenceError(`Undefined texture key "${key}".`);
		}

		return this.getRenderer().getTextures()[key];
	}

	/**
	 * @inheritdoc
	 */
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

		const renderer = this.getRenderer();

		renderer.setShaderPath(this.getInstance().getParameter("shader_path"));
		renderer.setProjection(projection);
		this.#camera.setProjection(projection);

		await renderer.build();
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
				this._scene.add(component);

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
		for (let i = 0, l = components.length, listener; i < l; i++) {
			if (!(components[i] instanceof ReactiveComponent)) continue;

			/**
			 * @type {ReactiveComponent}
			 */
			const component = components[i];

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

		if (this._scene.isEmpty()) {
			return;
		}

		this.render();
	}

	/**
	 * @inheritdoc
	 */
	render() {
		console.debug(`render(): ${this._scene.getQueue().length} (${this._scene.getSubcomponentCount()}) in queue`);

		this.getRenderer().render(this._scene);

		/**
		 * @todo This is an example of why "scene" is not the best name for a render queue
		 */
		this._scene.clear();

		/**
		 * @todo Move updateCompositeTexture() to the instance/instance renderer
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
				.orthographic(new Vector2(viewport[2], viewport[3]))
				.multiply(Matrix3.scale(new Vector2(scale, scale))),
		);

		this.getRenderer().resize(viewport, this.#camera.getProjection());

		this._scene.resetSubcomponentCount();

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

			this._scene.add(component);
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
	 * @throws {Error} if the layer didn't return a component
	 */
	push(layer) {
		this.#layerStack.push(layer);

		// Discard event listeners of `ReactiveComponent` instances in the previous layers
		this.removeListeners(this.#reactiveComponents);

		this._scene.resetSubcomponentCount();
		this.#animatedComponents.length = 0;
		this.#reactiveComponents.length = 0;

		// Mark the tree length as the extraction index for this layer
		this.#lastInsertionIndices.push(this.#tree.length);

		const rootComponent = layer.build(this);

		if (!(rootComponent instanceof Component)) {
			throw new Error("The layer must return an instance of Component.");
		}

		this.#rootComponents.push(rootComponent);
		this.addChildrenToRenderQueue([rootComponent], {
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

		this._scene.add(component);

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

		/**
		 * @todo Also truncate the root components?
		 * 
		 * Truncate the tree (remove the components from the popped layer)
		 */
		this.#tree.length = this.#lastInsertionIndices.pop();

		this._scene.clear();
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