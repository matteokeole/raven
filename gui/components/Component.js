import {GUIComposite} from "../index.js";
import {Event} from "../Event/index.js";
import {Matrix3, Vector2} from "../../math/index.js";

/**
 * @typedef {Object} ComponentDescriptor
 * @property {Number} alignment
 * @property {?Vector2} [margin]
 * @property {Vector2} size
 * @property {?Object.<String, Function>} [events]
 */

/**
 * @abstract
 */
export class Component {
	/**
	 * @type {?GUIComposite}
	 */
	#eventDispatcher;

	/**
	 * @type {?Vector2}
	 */
	#position;

	/**
	 * @type {Number}
	 */
	#alignment;

	/**
	 * @type {Vector2}
	 */
	#margin;

	/**
	 * @type {Vector2}
	 */
	#size;

	/**
	 * @type {String[]}
	 */
	#events;

	/**
	 * @param {ComponentDescriptor} descriptor
	 */
	constructor({alignment, margin = new Vector2(), size, events = []}) {
		this.#eventDispatcher = null;
		this.#position = null;
		this.#alignment = alignment;
		this.#margin = margin;
		this.#size = size;
		this.#events = events;
	}

	/**
	 * @param {GUIComposite} eventDispatcher
	 */
	setEventDispatcher(eventDispatcher) {
		this.#eventDispatcher = eventDispatcher;
	}

	/**
	 * @returns {?Vector2}
	 */
	getPosition() {
		return this.#position;
	}

	/**
	 * @param {?Vector2} position
	 */
	setPosition(position) {
		this.#position = position;
	}

	/**
	 * @returns {Number}
	 */
	getAlignment() {
		return this.#alignment;
	}

	/**
	 * @returns {Vector2}
	 */
	getMargin() {
		return this.#margin;
	}

	/**
	 * @returns {Vector2}
	 */
	getSize() {
		return this.#size;
	}

	/**
	 * @param {Vector2} size
	 */
	setSize(size) {
		this.#size = size;
	}

	/**
	 * @returns {String[]}
	 */
	getEvents() {
		return this.#events;
	}

	/**
	 * Calculates the component absolute position.
	 * 
	 * @param {Vector2} initial Cloned parent top left corner
	 * @param {Vector2} parentSize Cloned parent size
	 */
	compute(initial, parentSize) {
		const x = ((this.#alignment & 0b111000) >> 4) * .5;
		const y = ((this.#alignment & 0b000111) >> 1) * .5;

		const displacement = parentSize
			.subtract(this.#size)
			.multiply(new Vector2(x, y));
		const marginDisplacement = new Vector2(x & 1, y & 1)
			.multiplyScalar(-2)
			.addScalar(1);
		const margin = this.#margin
			.clone()
			.multiply(marginDisplacement);

		this.#position = initial
			.add(displacement)
			.add(margin)
			.floor();
	}

	/**
	 * @returns {Matrix3}
	 */
	getWorld() {
		return Matrix3
			.translation(this.#position)
			.multiply(Matrix3.scale(this.#size));
	}

	/**
	 * @param {Event} event
	 */
	dispatchEvent(event) {
		this.#eventDispatcher.dispatchEvent(event);
	}
}