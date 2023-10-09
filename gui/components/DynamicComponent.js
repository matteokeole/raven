import {VisualComponent} from "./VisualComponent.js";
import {Vector2} from "../../math/index.js";

/**
 * @typedef {(position: Vector2)} EventListener
 */

/**
 * @abstract
 */
export class DynamicComponent extends VisualComponent {
	/**
	 * @param {DynamicComponent} component
	 * @param {?EventListener} eventListener
	 */
	static #initEventListener(component, eventListener) {
		if (eventListener === null) return null;

		eventListener = listener.bind(component);
		eventListener.component = component;

		return eventListener;
	}

	/**
	 * @type {Boolean}
	 */
	#hovered;

	/**
	 * @type {?Listener}
	 */
	#onMouseDown;

	/**
	 * @type {?Listener}
	 */
	#onMouseEnter;

	/**
	 * @type {?Listener}
	 */
	#onMouseLeave;

	/**
	 * @param {Object} options
	 * @param {Listener} [options.onMouseDown]
	 * @param {Listener} [options.onMouseEnter]
	 * @param {Listener} [options.onMouseLeave]
	 */
	constructor({onMouseDown = null, onMouseEnter = null, onMouseLeave = null}) {
		super(arguments[0]);

		this.#hovered = false;
		this.#onMouseDown = DynamicComponent.#initEventListener(this, onMouseDown);
		this.#onMouseEnter = DynamicComponent.#initEventListener(this, onMouseEnter);
		this.#onMouseLeave = DynamicComponent.#initEventListener(this, onMouseLeave);
	}

	/**
	 * @returns {Boolean}
	 */
	isHovered() {
		return this.#hovered;
	}

	/**
	 * @param {Boolean} hovered
	 */
	setHovered(hovered) {
		this.#hovered = hovered;
	}

	/**
	 * @returns {?EventListener}
	 */
	getOnMouseDown() {
		return this.#onMouseDown;
	}

	/**
	 * @param {?EventListener} onMouseDown
	 */
	setOnMouseDown(onMouseDown) {
		this.#onMouseDown = DynamicComponent.#initEventListener(this, onMouseDown);
	}

	/**
	 * @returns {?EventListener}
	 */
	getOnMouseEnter() {
		return this.#onMouseEnter;
	}

	/**
	 * @param {?EventListener} onMouseEnter
	 */
	setOnMouseEnter(onMouseEnter) {
		this.#onMouseEnter = DynamicComponent.#initEventListener(this, onMouseEnter);
	}

	/**
	 * @returns {?EventListener}
	 */
	getOnMouseLeave() {
		return this.#onMouseLeave;
	}

	/**
	 * @param {?EventListener} onMouseLeave
	 */
	setOnMouseLeave(onMouseLeave) {
		this.#onMouseLeave = DynamicComponent.#initEventListener(this, onMouseLeave);
	}
}