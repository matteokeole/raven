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
	 * @param {Object} options
	 * @param {Number} options.alignment
	 * @param {Vector2} [options.margin]
	 * @param {Vector2} options.size
	 * @param {EventListener} [options.onMouseDown]
	 * @param {EventListener} [options.onMouseEnter]
	 * @param {EventListener} [options.onMouseLeave]
	 */
	constructor({alignment, margin, size, onMouseDown = null, onMouseEnter = null, onMouseLeave = null}) {
		super({alignment, margin, size});

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