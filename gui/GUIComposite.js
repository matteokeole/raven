import {Component, DynamicComponent, GUIRenderer, Layer, StructuralComponent} from "./index.js";
import {OrthographicCamera} from "../cameras/index.js";
import {Matrix3, Vector2} from "../math/index.js";
import {extend} from "../utils/index.js";
import {AbstractInstance, Composite} from "../index.js";
import {BitmapFont} from "../fonts/index.js";

/**
 * @param {Object} options
 * @param {GUIRenderer} options.renderer
 * @param {AbstractInstance} options.instance Reference to the current instance, used for updating the canvas texture, registering listeners and manipulating the GUI scale.
 * @param {Object.<String, BitmapFont>} options.fonts
 */
export function GUIComposite({renderer, instance, fonts}) {
	Composite.call(this, renderer, instance);

	/**
	 * @private
	 * @type {Number}
	 */
	let subcomponentCount = 0;

	/** @type {Camera} */
	const camera = new OrthographicCamera(instance.getRenderer().getViewport());

	/** @type {Layer[]} */
	const layerStack = [];

	/** @type {Component[]} */
	const rootComponents = [];

	/** @type {DynamicComponent[]} */
	const dynamicComponents = [];

	/**
	 * Children of currently built layers.
	 * 
	 * @type {Component[]}
	 */
	const tree = [];

	/**
	 * Components registered for the next render.
	 * 
	 * @type {Component[]}
	 */
	const renderQueue = [];

	/** @type {Number[]} */
	const lastInsertionIndices = [];

	/** @returns {AbstractInstance} */
	this.getInstance = () => instance;

	/**
	 * @param {String} key
	 * @returns {BitmapFont}
	 * @throws {ReferenceError}
	 */
	this.getFont = function(key) {
		if (!(key in fonts)) {
			throw new ReferenceError(`Undefined font ${key}.`);
		}

		return fonts[key];
	};

	/** @returns {?Texture} */
	this.getTexture = path => renderer.getUserTextures()[path];

	this.build = async function() {
		const glyphMapPath = instance.getParameter("font_path");

		for (let font in fonts) {
			await fonts[font].loadGlyphs(`${glyphMapPath}/${font}.json`);
		}

		const scale = instance.getParameter("current_scale");

		camera.setProjection(
			Matrix3
				.orthographic(instance.getRenderer().getViewport())
				.multiply(Matrix3.scale(new Vector2(scale, scale))),
		);

		await renderer.build(instance.getParameter("shader_path"), camera.getProjection());
	};

	/**
	 * Populates the component tree.
	 * Recursive.
	 * 
	 * @param {Component[]} children
	 * @param {Object} options
	 * @param {Boolean} [options.addListeners=false]
	 * @param {Boolean} [options.addToTree=false]
	 */
	this.addChildrenToRenderQueue = function(children, {addListeners = false, addToTree = false}) {
		for (let i = 0, l = children.length, component; i < l; i++) {
			component = children[i];

			if (!(component instanceof StructuralComponent)) {
				renderQueue.push(component);

				subcomponentCount += component.getSubcomponents().length;

				if (component instanceof DynamicComponent) {
					dynamicComponents.push(component);

					if (addListeners) this.addListeners(component);
				}
				if (addToTree) tree.push(component);

				continue;
			}

			this.addChildrenToRenderQueue(component.getChildren(), {addListeners, addToTree});
		}
	};

	/**
	 * Initializes the event listeners for the provided component.
	 * 
	 * @param {Component} component
	 */
	this.addListeners = function(component) {
		let listener;

		if (listener = component.getOnMouseDown()) instance.addListener("mouse_down", listener);
		if (listener = component.getOnMouseEnter()) instance.addListener("mouse_enter", listener);
		if (listener = component.getOnMouseLeave()) instance.addListener("mouse_leave", listener);
	};

	/**
	 * Discards event listeners for the provided components.
	 * 
	 * @param {Component[]} components
	 */
	this.removeListeners = function(components) {
		for (let i = 0, l = components.length, component, listener; i < l; i++) {
			if (!(components[i] instanceof DynamicComponent)) continue;

			component = components[i];

			if (listener = component.getOnMouseDown()) instance.removeListener("mouse_down", listener);
			if (listener = component.getOnMouseEnter()) instance.removeListener("mouse_enter", listener);
			if (listener = component.getOnMouseLeave()) instance.removeListener("mouse_leave", listener);
		}
	};

	/**
	 * Computes the absolute position for each component of the render queue.
	 * 
	 * @returns {GUIComposite}
	 */
	this.compute = function() {
		const viewport = instance
			.getRenderer()
			.getViewport()
			.clone()
			.divideScalar(instance.getParameter("current_scale"));

		for (let i = 0, l = rootComponents.length; i < l; i++) {
			rootComponents[i].compute(new Vector2(), viewport.clone());
		}

		return this;
	};

	this.render = function() {
		renderer.render(renderQueue, subcomponentCount);

		renderQueue.length = subcomponentCount = 0;

		instance.getRenderer().updateCompositeTexture(this.getIndex(), renderer.getCanvas());
	};

	/**
	 * Resizes the viewport of the renderer and triggers a new render.
	 * NOTE: Resize events render ALL the components from the layer stack.
	 * 
	 * @param {Vector2} viewport
	 */
	this.resize = function(viewport) {
		const scale = instance.getParameter("current_scale");

		/** @todo Replace by OrthographicCamera.updateProjection */
		camera.setProjection(
			Matrix3
				.orthographic(viewport)
				.multiply(Matrix3.scale(new Vector2(scale, scale))),
		);

		renderer.resize(viewport, camera.getProjection());
		subcomponentCount = 0;

		// Add all components to the render queue
		for (let i = 0, l = tree.length, component; i < l; i++) {
			component = tree[i];

			if (component instanceof StructuralComponent) {
				this.addChildrenToRenderQueue(component.getChildren(), {
					addListeners: false,
					addToTree: false,
				});

				continue;
			}

			renderQueue.push(component);
			subcomponentCount += component.getSubcomponents().length;
		}

		this.compute().render();
	};

	/**
	 * Adds a new layer on top of the layer stack.
	 * Calling this method will result in all the children of the new layer
	 * being registered into the render queue.
	 * The new components will be rendered on top of the previous ones.
	 * 
	 * @param {Layer} layer
	 */
	this.push = function(layer) {
		layerStack.push(layer);

		// Discard event listeners of `DynamicComponent` instances in the previous layers
		this.removeListeners(dynamicComponents);

		dynamicComponents.length = subcomponentCount = 0;

		// Mark the tree length as the extraction index for this layer
		lastInsertionIndices.push(tree.length);

		const builtComponents = layer.build(this);
		rootComponents.push(...builtComponents);

		this.addChildrenToRenderQueue(builtComponents, {
			addListeners: true,
			addToTree: true,
		});

		this.compute().render();
	};

	/**
	 * @todo Render queue unique check
	 * 
	 * Adds the provided component to the render queue.
	 * 
	 * @param {Component} component
	 * @returns {GUIComposite}
	 */
	this.pushToRenderQueue = function(component) {
		if (component instanceof StructuralComponent) {
			const children = component.getChildren();

			for (let i = 0, l = children.length; i < l; i++) this.pushToRenderQueue(children[i]);

			return this;
		}

		renderQueue.push(component);

		subcomponentCount += component.getSubcomponents().length;

		return this;
	};

	/**
	 * Removes the last layer from the layer stack.
	 * Calling this method will result in all the children of all the stacked layers
	 * being registered into the render queue.
	 * If the layer stack is empty or contains one layer, nothing will be done.
	 */
	this.pop = function() {
		if (layerStack.length === 0) throw Error("Could not pop: no layers registered.");
		if (layerStack.length === 1) throw Error("Could not pop the only entry of the layer stack.");

		this.removeListeners(dynamicComponents);

		// Truncate the tree (remove the components from the popped layer)
		tree.length = lastInsertionIndices.pop();

		dynamicComponents.length = renderQueue.length = subcomponentCount = 0;
		this.addChildrenToRenderQueue(tree, {
			addListeners: true,
			addToTree: false,
		});

		// Clear already rendered components
		renderer.clear();

		this.compute().render();
	};
}

extend(GUIComposite, Composite);