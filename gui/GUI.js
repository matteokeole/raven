import {Component, DynamicComponent, GUIRenderer, Layer, Subcomponent, StructuralComponent} from "./index.js";
import {OrthographicCamera} from "../cameras/index.js";
import {Matrix3, Vector2} from "../math/index.js";
import {RendererManager} from "../RendererManager.js";

/**
 * @extends RendererManager
 * @param {Instance} instance Reference to the current instance, used for uploading the new render onto the output texture, registering listeners and manipulating the GUI scale.
 * @param {GUIRenderer} renderer
 */
export function GUI(instance, renderer) {
	RendererManager.call(this, instance, renderer);

	/** @type {Instance} */
	this.instance = instance;

	/** @type {WebGLRenderer} */
	this.renderer = renderer;

	/** @type {Camera} */
	this.camera = new OrthographicCamera(instance.getViewport());

	/** @type {Layer[]} */
	this.layerStack = [];

	/**
	 * @todo Replace by `builtComponents`?
	 * 
	 * Children of currently built layers.
	 * 
	 * @type {Component[]}
	 */
	this.tree = [];

	/**
	 * Components registered for the next render.
	 * 
	 * @type {Component[]}
	 */
	this.renderQueue = [];

	/** @type {Number[]} */
	this.lastInsertionIndices = [];

	/** @type {Object<String, Subcomponent>} */
	this.fontSubcomponents = {};

	this.init = async function() {
		const {currentScale} = this.instance;
		const shaderPath = this.instance.getShaderPath();
		const viewport = this.instance.getViewport();
		const projectionMatrix = this.camera.projectionMatrix = Matrix3
			.projection(viewport)
			.scale(new Vector2(currentScale, currentScale));

		await this.renderer.init(shaderPath, projectionMatrix);
	};

	/**
	 * @todo Measure performance
	 * 
	 * @param {Object} fontData
	 */
	this.loadFontSubcomponents = function(fontData) {
		fontData = Object.entries(fontData);

		this.fontSubcomponents = Object.fromEntries(
			fontData.map(([key, {width, uv}]) => [
				key,
				new Subcomponent({
					size: new Vector2(width, 8),
					offset: new Vector2(0, 0),
					uv: new Vector2(...uv),
				}),
			]),
		);

		/* for (let i = 0, l = fontData.length, symbol, character; i < l; i++) {
			[symbol, character] = fontData[i];

			this.fontSubcomponents[symbol] = new Subcomponent({
				size: new Vector2(character.width, 8),
				offset: new Vector2(0, 0),
				uv: new Vector2(...character.uv),
			});
		} */
	};

	/**
	 * Populates the component tree.
	 * NOTE: Recursive.
	 * 
	 * @param {Component[]} children
	 * @param {Object} options
	 * @param {Boolean} [options.parent]
	 * @param {Boolean} [options.addListeners=false]
	 * @param {Boolean} [options.addToTree=false]
	 */
	this.addChildrenToRenderQueue = function(children, {parent, addListeners = false, addToTree = false}) {
		const viewport = this.instance
			.getViewport()
			.divideScalar(this.instance.currentScale);

		for (let i = 0, l = children.length, component; i < l; i++) {
			component = children[i];

			if (parent) component.setParent(parent);

			if (component instanceof StructuralComponent) {
				component.computePosition(new Vector2(0, 0), viewport);

				this.addChildrenToRenderQueue(component.getChildren(), {
					parent: component,
					addListeners,
					addToTree,
				});

				continue;
			}

			this.renderQueue.push(component);

			if (addListeners && component instanceof DynamicComponent) this.addListeners(component);
			if (addToTree) this.tree.push(component);
		}
	};

	/**
	 * Initialize event listeners for the provided component.
	 * 
	 * @param {Component} component
	 */
	this.addListeners = function(component) {
		const {instance} = this;
		let listener;

		if (listener = component.getOnMouseDown()) instance.addMouseDownListener(listener);
		if (listener = component.getOnMouseEnter()) instance.addMouseEnterListener(listener);
		if (listener = component.getOnMouseLeave()) instance.addMouseLeaveListener(listener);
	};

	/**
	 * Discards event listeners for the provided component.
	 * 
	 * @param {Component[]} components
	 */
	this.removeListeners = function(components) {
		const {instance} = this;

		for (let i = 0, l = components.length, component, listener; i < l; i++) {
			component = components[i];

			if (!(component instanceof DynamicComponent)) continue;

			if (listener = component.getOnMouseDown()) instance.removeMouseDownListener(listener);
			if (listener = component.getOnMouseEnter()) instance.removeMouseEnterListener(listener);
			if (listener = component.getOnMouseLeave()) instance.removeMouseLeaveListener(listener);
		}
	};

	/**
	 * Computes the absolute position for each component of the render queue.
	 */
	this.computeTree = function() {
		for (
			let i = 0,
				queue = this.renderQueue,
				l = queue.length,
				viewport = this.instance
					.getViewport()
					.divideScalar(this.instance.currentScale);
			i < l;
			i++
		) queue[i].computePosition(new Vector2(0, 0), viewport);
	};

	this.render = function() {
		this.renderer.render(this.renderQueue, this.camera);

		// Clear the render queue
		this.renderQueue.length = 0;

		this.instance.updateRendererTexture(0, this.renderer.canvas);
	};

	/**
	 * Resizes the viewport of the renderer and triggers a new render.
	 * NOTE: Resize events render ALL the components from the layer stack.
	 * 
	 * @param {Vector2} viewport
	 */
	this.resize = function(viewport) {
		const {currentScale} = this.instance;

		/** @todo Replace by `OrthographicCamera.updateProjectionMatrix` */
		this.camera.projectionMatrix = Matrix3
			.projection(viewport)
			.scale(new Vector2(currentScale, currentScale));

		this.renderer.resize(viewport, this.camera.projectionMatrix);

		// Add all components to the render queue
		for (let i = 0, l = this.tree.length, component; i < l; i++) {
			component = this.tree[i];

			if (component instanceof StructuralComponent) {
				this.addChildrenToRenderQueue(component.getChildren(), {
					parent: component,
					addListeners: false,
					addToTree: false,
				});

				continue;
			}

			this.renderQueue.push(component);
		}

		this.computeTree();
		this.render();
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
		this.layerStack.push(layer);

		// Discard event listeners of previous layers
		this.removeListeners(this.tree);

		this.lastInsertionIndices.push(this.tree.length);
		this.addChildrenToRenderQueue(layer.build(this), {
			addListeners: true,
			addToTree: true,
		});

		this.computeTree();
		this.render();
	};

	/**
	 * Disposes the last layer from the layer stack.
	 * Calling this method will result in all the children of all the stacked layers
	 * being registered into the render queue.
	 * If the layer stack is empty or contains one layer, nothing will be done.
	 */
	this.pop = function() {
		const {layerStack} = this;

		if (layerStack.length === 0 || layerStack.length === 1) return;

		const layer = layerStack.pop();
		layer.dispose();

		const lastInsertion = this.lastInsertionIndices.pop();

		/** @todo Rework event listener discard */
		const componentsToDiscard = [...this.tree].splice(lastInsertion);
		this.removeListeners(componentsToDiscard);

		/** @todo Rework component removal */
		this.tree = this.tree.slice(0, lastInsertion);

		// Clear the render queue
		this.renderQueue.length = 0;

		this.addChildrenToRenderQueue(this.tree, {
			addListeners: true,
			addToTree: false,
		});

		this.computeTree();
		this.renderer.clear(); // Clear already rendered components
		this.render();

		this.instance.updateRendererTexture(0, this.renderer.canvas);
	};
}