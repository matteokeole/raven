import {Component, DynamicComponent, GUIRenderer, Layer, Subcomponent, StructuralComponent} from "./index.js";
import {OrthographicCamera} from "../cameras/index.js";
import {Matrix3, Vector2} from "../math/index.js";
import {extend} from "../utils/index.js";
import {RendererManager} from "../RendererManager.js";

/**
 * @extends RendererManager
 * @param {GUIRenderer} renderer
 * @param {Instance} instance Reference to the current instance, used for uploading the new render onto the output texture, registering listeners and manipulating the GUI scale.
 */
export function GUI(renderer, instance) {
	RendererManager.call(this, renderer, instance);

	/** @type {Number} */
	let subcomponentCount = 0;

	/** @type {Camera} */
	const camera = new OrthographicCamera(instance.getViewport());

	/** @type {Layer[]} */
	const layerStack = [];

	/**
	 * @todo Replace by `builtComponents`?
	 * 
	 * Children of currently built layers.
	 * 
	 * @type {Component[]}
	 */
	let tree = [];

	/**
	 * Components registered for the next render.
	 * 
	 * @type {Component[]}
	 */
	const renderQueue = [];

	/** @type {Number[]} */
	const lastInsertionIndices = [];

	/** @type {Object<String, Subcomponent>} */
	const fontSubcomponents = {};

	/** @returns {?Texture} */
	this.getTexture = path => renderer.getTextures()[path];

	/** @returns {Object<String, Subcomponent>} */
	this.getFontSubcomponents = () => fontSubcomponents;

	this.init = async function() {
		camera.projectionMatrix = Matrix3
			.projection(instance.getViewport())
			.scale(new Vector2(instance.currentScale, instance.currentScale));

		await renderer.init(instance.getShaderPath(), camera.projectionMatrix);
	};

	/**
	 * @todo Measure performance
	 * 
	 * @param {Object} fontData
	 */
	this.loadFontSubcomponents = function(fontData) {
		fontData = Object.entries(fontData);

		for (let i = 0, l = fontData.length, symbol, character; i < l; i++) {
			[symbol, character] = fontData[i];

			fontSubcomponents[symbol] = new Subcomponent({
				size: new Vector2(character.width, 8),
				offset: new Vector2(0, 0),
				uv: new Vector2(...character.uv),
			});
		}
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
		const viewport = instance
			.getViewport()
			.divideScalar(instance.currentScale);

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

			renderQueue.push(component);
			subcomponentCount += component.getSubcomponents().length;

			if (addListeners && component instanceof DynamicComponent) this.addListeners(component);
			if (addToTree) tree.push(component);
		}
	};

	/**
	 * Initialize event listeners for the provided component.
	 * 
	 * @param {Component} component
	 */
	this.addListeners = function(component) {
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
		for (let i = 0, l = components.length, component, listener; i < l; i++) {
			component = components[i];

			if (!(component instanceof DynamicComponent)) continue;

			if (listener = component.getOnMouseDown()) instance.removeMouseDownListener(listener);
			if (listener = component.getOnMouseEnter()) instance.removeMouseEnterListener(listener);
			if (listener = component.getOnMouseLeave()) instance.removeMouseLeaveListener(listener);
		}
	};

	/**
	 * @todo Rework
	 * 
	 * Computes the absolute position for each component of the render queue.
	 */
	this.computeTree = function() {
		for (
			let i = 0,
				l = renderQueue.length,
				viewport = instance
					.getViewport()
					.divideScalar(instance.currentScale);
			i < l;
			i++
		) renderQueue[i].computePosition(new Vector2(0, 0), viewport);
	};

	this.render = function() {
		renderer.render(renderQueue, camera, subcomponentCount);

		renderQueue.length = subcomponentCount = 0;

		instance.updateRendererTexture(0, renderer.getCanvas());
	};

	/**
	 * Resizes the viewport of the renderer and triggers a new render.
	 * NOTE: Resize events render ALL the components from the layer stack.
	 * 
	 * @param {Vector2} viewport
	 */
	this.resize = function(viewport) {
		/** @todo Replace by `OrthographicCamera.updateProjectionMatrix` */
		camera.projectionMatrix = Matrix3
			.projection(viewport)
			.scale(new Vector2(instance.currentScale, instance.currentScale));

		renderer.resize(viewport, camera.projectionMatrix);
		subcomponentCount = 0;

		// Add all components to the render queue
		for (let i = 0, l = tree.length, component; i < l; i++) {
			component = tree[i];

			if (component instanceof StructuralComponent) {
				this.addChildrenToRenderQueue(component.getChildren(), {
					parent: component,
					addListeners: false,
					addToTree: false,
				});

				continue;
			}

			renderQueue.push(component);
			subcomponentCount += component.getSubcomponents().length;
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
		layerStack.push(layer);

		// Discard event listeners of previous layers
		this.removeListeners(tree);

		lastInsertionIndices.push(tree.length);
		subcomponentCount = 0;
		this.addChildrenToRenderQueue(layer.build(this), {
			addListeners: true,
			addToTree: true,
		});

		this.computeTree();
		this.render();
	};

	/**
	 * Adds [component] to the render queue.
	 * 
	 * @param {Component} component
	 * @returns {GUI}
	 */
	this.pushToRenderQueue = function(component) {
		renderQueue.push(component);

		if (component instanceof StructuralComponent) return;

		subcomponentCount += component.getSubcomponents().length;

		return this;
	};

	/**
	 * Disposes the last layer from the layer stack.
	 * Calling this method will result in all the children of all the stacked layers
	 * being registered into the render queue.
	 * If the layer stack is empty or contains one layer, nothing will be done.
	 */
	this.pop = function() {
		if (layerStack.length === 0 || layerStack.length === 1) return;

		const layer = layerStack.pop();
		layer.dispose();

		const lastInsertion = lastInsertionIndices.pop();

		/** @todo Optimize event listener discard */
		const componentsToDiscard = [...tree].splice(lastInsertion);
		this.removeListeners(componentsToDiscard);

		/** @todo Rework component removal */
		tree = tree.slice(0, lastInsertion);

		// Clear the render queue
		renderQueue.length = 0;

		subcomponentCount = 0;
		this.addChildrenToRenderQueue(tree, {
			addListeners: true,
			addToTree: false,
		});

		this.computeTree();
		renderer.clear(); // Clear already rendered components
		this.render();
	};
}

extend(GUI, RendererManager);