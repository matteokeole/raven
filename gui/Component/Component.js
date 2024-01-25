import {GUIComposite} from "../index.js";
import {Event} from "../Event/index.js";
import {Matrix3, Vector2} from "../../math/index.js";

/**
 * @typedef {Object} ComponentDescriptor
 * @property {Number} alignment
 * @property {?Vector2} [margin]
 * @property {Vector2} size
 * @property {?String[]} [events]
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
	constructor(descriptor) {
		this.#eventDispatcher = null;
		this.#position = null;
		this.#alignment = descriptor.alignment;
		this.#margin = descriptor.margin ?? new Vector2();
		this.#size = descriptor.size;
		this.#events = descriptor.events ?? [];
	}

	/**
	 * @param {GUIComposite} eventDispatcher
	 */
	setEventDispatcher(eventDispatcher) {
		this.#eventDispatcher = eventDispatcher;
	}

	getPosition() {
		return this.#position;
	}

	/**
	 * @param {?Vector2} position
	 */
	setPosition(position) {
		this.#position = position;
	}

	getAlignment() {
		return this.#alignment;
	}

	getMargin() {
		return this.#margin;
	}

	/**
	 * @param {Vector2} margin
	 */
	setMargin(margin) {
		this.#margin = margin;
	}

	getSize() {
		return this.#size;
	}

	/**
	 * @param {Vector2} size
	 */
	setSize(size) {
		this.#size = size;
	}

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
	 * @todo Use within the GUI renderer to create the subcomponent world matrix
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