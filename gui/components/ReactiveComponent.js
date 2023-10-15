import {VisualComponent} from "./VisualComponent.js";
import {Vector2} from "../../math/index.js";

/**
 * @typedef {(position: Vector2) => void} EventListener
 */

/**
 * @abstract
 */
export class ReactiveComponent extends VisualComponent {
	/**
	 * @param {ReactiveComponent} component
	 * @param {?EventListener} eventListener
	 */
	static #initEventListener(component, eventListener) {
		if (eventListener === null) return null;

		eventListener = eventListener.bind(component);
		eventListener.component = component;

		return eventListener;
	}

	/**
	 * @type {Boolean}
	 */
	#hovered;

	/**
	 * @type {?EventListener}
	 */
	#onMouseDown;

	/**
	 * @type {?EventListener}
	 */
	#onMouseEnter;

	/**
	 * @type {?EventListener}
	 */
	#onMouseLeave;

	/**
	 * @param {Object} options
	 * @param {EventListener} [options.onMouseDown]
	 * @param {EventListener} [options.onMouseEnter]
	 * @param {EventListener} [options.onMouseLeave]
	 */
	constructor({onMouseDown = null, onMouseEnter = null, onMouseLeave = null}) {
		super(arguments[0]);

		this.#hovered = false;
		this.#onMouseDown = ReactiveComponent.#initEventListener(this, onMouseDown);
		this.#onMouseEnter = ReactiveComponent.#initEventListener(this, onMouseEnter);
		this.#onMouseLeave = ReactiveComponent.#initEventListener(this, onMouseLeave);
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
		this.#onMouseDown = ReactiveComponent.#initEventListener(this, onMouseDown);
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
		this.#onMouseEnter = ReactiveComponent.#initEventListener(this, onMouseEnter);
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
		this.#onMouseLeave = ReactiveComponent.#initEventListener(this, onMouseLeave);
	}
}