import {VisualComponent} from "./VisualComponent.js";
import {Vector2} from "../../math/index.js";
import {TextureContainer} from "../../wrappers/index.js";

/**
 * @typedef {(position: Vector2) => void} EventListener
 */

/**
 * @typedef {Object} ReactiveComponentDescriptor
 * @property {Number} alignment
 * @property {?Vector2} [margin]
 * @property {Vector2} size
 * @property {?Object.<String, Function>} [on]
 * @property {?TextureContainer} [texture]
 * @property {?EventListener} [onMouseDown]
 * @property {?EventListener} [onMouseEnter]
 * @property {?EventListener} [onMouseLeave]
 */

/**
 * @abstract
 */
export class ReactiveComponent extends VisualComponent {
	/**
	 * @param {?EventListener} eventListener
	 * @returns {?EventListener}
	 */
	#initEventListener(eventListener) {
		if (eventListener === null) {
			return null;
		}

		eventListener = eventListener.bind(this);
		eventListener.component = this;

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
	 * @param {ReactiveComponentDescriptor} descriptor
	 */
	constructor({alignment, margin, size, on, texture, onMouseDown = null, onMouseEnter = null, onMouseLeave = null}) {
		super({alignment, margin, size, on, texture});

		this.#hovered = false;
		this.#onMouseDown = this.#initEventListener(onMouseDown);
		this.#onMouseEnter = this.#initEventListener(onMouseEnter);
		this.#onMouseLeave = this.#initEventListener(onMouseLeave);
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
		this.#onMouseDown = this.#initEventListener(onMouseDown);
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
		this.#onMouseEnter = this.#initEventListener(onMouseEnter);
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
		this.#onMouseLeave = this.#initEventListener(onMouseLeave);
	}
}