import {VisualComponent} from "./VisualComponent.js";
import {Vector2} from "../../math/index.js";
import {TextureContainer} from "../../wrappers/index.js";

/**
 * @typedef {Object} ReactiveComponentDescriptor
 * @property {Number} alignment
 * @property {?Vector2} [margin]
 * @property {Vector2} size
 * @property {?Object.<String, Function>} [events]
 * @property {?TextureContainer} [texture]
 * @property {?Function} [onMouseDown]
 * @property {?Function} [onMouseEnter]
 * @property {?Function} [onMouseLeave]
 */

/**
 * @abstract
 */
export class ReactiveComponent extends VisualComponent {
	/**
	 * @deprecated
	 * 
	 * @param {?Function} eventListener
	 * @returns {?Function}
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
	 * @deprecated
	 * 
	 * @type {?Function}
	 */
	#onMouseDown;

	/**
	 * @deprecated
	 * 
	 * @type {?Function}
	 */
	#onMouseEnter;

	/**
	 * @deprecated
	 * 
	 * @type {?Function}
	 */
	#onMouseLeave;

	/**
	 * @param {ReactiveComponentDescriptor} descriptor
	 */
	constructor({alignment, margin, size, events, texture, onMouseDown = null, onMouseEnter = null, onMouseLeave = null}) {
		super({alignment, margin, size, events, texture});

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
	 * @deprecated
	 * 
	 * @returns {?Function}
	 */
	getOnMouseDown() {
		return this.#onMouseDown;
	}

	/**
	 * @deprecated
	 * 
	 * @param {?Function} onMouseDown
	 */
	setOnMouseDown(onMouseDown) {
		this.#onMouseDown = this.#initEventListener(onMouseDown);
	}

	/**
	 * @deprecated
	 * 
	 * @returns {?Function}
	 */
	getOnMouseEnter() {
		return this.#onMouseEnter;
	}

	/**
	 * @deprecated
	 * 
	 * @param {?Function} onMouseEnter
	 */
	setOnMouseEnter(onMouseEnter) {
		this.#onMouseEnter = this.#initEventListener(onMouseEnter);
	}

	/**
	 * @deprecated
	 * 
	 * @returns {?Function}
	 */
	getOnMouseLeave() {
		return this.#onMouseLeave;
	}

	/**
	 * @deprecated
	 * 
	 * @param {?Function} onMouseLeave
	 */
	setOnMouseLeave(onMouseLeave) {
		this.#onMouseLeave = this.#initEventListener(onMouseLeave);
	}
}