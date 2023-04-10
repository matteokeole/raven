import {Component, DynamicComponent, GUIRenderer, Layer, Subcomponent, StructuralComponent} from "./index.js";
import {OrthographicCamera} from "../cameras/index.js";
import {Matrix3, Vector2} from "../math/index.js";
import {extend} from "../utils/index.js";
import {Font, RendererComposite} from "../index.js";

/**
 * @extends RendererComposite
 * @param {GUIRenderer} renderer
 * @param {Instance} instance Reference to the current instance, used for updating the canvas texture, registering listeners and manipulating the GUI scale.
 */
export function GUIComposite(renderer, instance) {
	RendererComposite.call(this, renderer, instance);

	/** @type {Number} */
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

	/** @type {Object.<String, Font>} */
	const fonts = {};

	/** @type {?Font} */
	let mainFont;

	/** @returns {Instance} */
	this.getInstance = () => instance;

	/** @returns {Object.<String, Font>} */
	this.getFonts = () => fonts;

	/** @param {Font[]} value */
	this.setFonts = value => {
		this.setMainFont(value[0]);

		for (let i = 0, l = value.length, font; i < l; i++) {
			fonts[(font = value[i]).getName()] = font;
		}
	};

	/** @returns {?Font} */
	this.getMainFont = () => mainFont;

	/** @param {Font} value */
	this.setMainFont = value => void (mainFont = value);

	/** @returns {?Texture} */
	this.getTexture = path => renderer.getTextures()[path];

	this.init = async function() {
		camera.projectionMatrix = Matrix3
			.projection(instance.getViewport())
			.scale(new Vector2(instance.currentScale, instance.currentScale));

		await renderer.init(instance.getShaderPath(), camera.projectionMatrix);
	};

	/**
	 * Populates the component tree.
	 * NOTE: Recursive.
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

			this.addChildrenToRenderQueue(component.getChildren(), {
				addListeners,
				addToTree,
			});
		}
	};

	/**
	 * Initializes the event listeners for the provided component.
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
	 * Discards event listeners for the provided components.
	 * 
	 * @param {Component[]} components
	 */
	this.removeListeners = function(components) {
		for (let i = 0, l = components.length, component, listener; i < l; i++) {
			if (!(components[i] instanceof DynamicComponent)) continue;

			component = components[i];

			if (listener = component.getOnMouseDown()) instance.removeMouseDownListener(listener);
			if (listener = component.getOnMouseEnter()) instance.removeMouseEnterListener(listener);
			if (listener = component.getOnMouseLeave()) instance.removeMouseLeaveListener(listener);
		}
	};

	/**
	 * Computes the absolute position for each component of the render queue.
	 */
	this.computeTree = function() {
		const viewport = instance
			.getViewport()
			.divideScalar(instance.currentScale);

		for (let i = 0, l = rootComponents.length; i < l; i++) {
			rootComponents[i].computePosition(new Vector2(0, 0), viewport);
		}
	};

	/** @todo Better way to update the rendered texture */
	this.render = function() {
		renderer.render(renderQueue, subcomponentCount);

		renderQueue.length = subcomponentCount = 0;

		instance.setCompositeTexture(this.getIndex(), renderer.getCanvas());
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

		// Discard event listeners of `DynamicComponent` instances in the previous layers
		this.removeListeners(dynamicComponents);

		dynamicComponents.length = 0;

		// Mark the tree length as the extraction index for this layer
		lastInsertionIndices.push(tree.length);

		subcomponentCount = 0;
		const builtComponents = layer.build(this);
		rootComponents.push(...builtComponents);

		this.addChildrenToRenderQueue(builtComponents, {
			addListeners: true,
			addToTree: true,
		});

		this.computeTree();
		this.render();
	};

	/**
	 * @todo Don't add groups directly to the queue
	 * 
	 * Adds the provided component to the render queue.
	 * 
	 * @param {Component} component
	 * @returns {GUIComposite}
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
		if (layerStack.length === 0) throw Error("Could not pop: no layers registered.");
		if (layerStack.length === 1) throw Error("Could not pop the only entry of the layer stack.");

		layerStack.pop().dispose();

		this.removeListeners(dynamicComponents);
		dynamicComponents.length = 0;

		// Truncate the tree (remove the components from the popped layer)
		tree.length = lastInsertionIndices.pop();

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

	this.dispose = () => renderer.dispose();
}

extend(GUIComposite, RendererComposite);

/**
 * @todo Measure performance
 * 
 * @param {Font[]} fonts
 */
GUIComposite.prototype.setupFonts = async function(fonts) {
	/** @type {String} */
	const fontPath = this.getInstance().getFontPath();

	for (let i = 0, j, fl = fonts.length, font, data, dl, letterHeight, characters, symbol, character; i < fl; i++) {
		font = fonts[i];

		await font.load(fontPath);

		data = Object.entries(font.getData());
		letterHeight = font.getLetterHeight();
		characters = {};

		for (j = 0, dl = data.length; j < dl; j++) {
			[symbol, character] = data[j];

			characters[symbol] = new Subcomponent({
				size: new Vector2(character.width, letterHeight),
				offset: new Vector2(0, 0),
				uv: new Vector2(character.uv[0], character.uv[1]),
			});
		}

		font.setCharacters(characters);
	}

	this.setFonts(fonts);
};

/** @returns {?Font} */
GUIComposite.prototype.getFont = function(name) {
	return this.getFonts()[name];
};