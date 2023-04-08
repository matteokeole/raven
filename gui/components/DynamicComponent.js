import {VisualComponent} from "../index.js";
import {extend} from "../../utils/index.js";

/** @typedef {(position: Vector2) => void} Listener */

/**
 * @extends VisualComponent
 * @param {{
 *    onMouseDown: ?Listener,
 *    onMouseEnter: ?Listener,
 *    onMouseLeave: ?Listener,
 * }}
 */
export function DynamicComponent({onMouseDown, onMouseEnter, onMouseLeave}) {
	VisualComponent.apply(this, arguments);

	/** @type {Boolean} */
	let isHovered = false;

	/** @type {?Listener} */
	onMouseDown &&= configureListener.call(this, onMouseDown);

	/** @type {?Listener} */
	onMouseEnter &&= configureListener.call(this, onMouseEnter);

	/** @type {?Listener} */
	onMouseLeave &&= configureListener.call(this, onMouseLeave);

	/** @returns {Boolean} */
	this.getIsHovered = () => isHovered;

	/** @param {Boolean} value */
	this.setIsHovered = value => void (isHovered = value);

	/** @returns {?Listener} */
	this.getOnMouseDown = () => onMouseDown;

	/** @param {Listener} value */
	this.setOnMouseDown = value => void (onMouseDown = configureListener.call(this, value));

	/** @returns {?Listener} */
	this.getOnMouseEnter = () => onMouseEnter;

	/** @param {Listener} value */
	this.setOnMouseEnter = value => void (onMouseEnter = configureListener.call(this, value));

	/** @returns {?Listener} */
	this.getOnMouseLeave = () => onMouseLeave;

	/** @param {Listener} value */
	this.setOnMouseLeave = value => void (onMouseLeave = configureListener.call(this, value));
}

extend(DynamicComponent, VisualComponent);

function configureListener(listener) {
	listener = listener.bind(this);
	listener.component = this;

	return listener;
}