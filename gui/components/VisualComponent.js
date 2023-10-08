import {Component} from "../index.js";
import {extend} from "../../utils/index.js";
import {Texture} from "../../wrappers/index.js";

/**
 * @abstract
 * @extends Component
 */
export function VisualComponent() {
	Component.apply(this, arguments);

	/** @type {Subcomponent[]} */
	let subcomponents = [];

	/** @type {Texture} */
	let texture;

	/** @returns {Subcomponent[]} */
	this.getSubcomponents = () => subcomponents;

	/** @param {Subcomponent[]} value */
	this.setSubcomponents = value => void (subcomponents = value);

	/** @returns {Texture} */
	this.getTexture = () => texture;

	/** @param {Texture} value */
	this.setTexture = value => void (texture = value);
}

extend(VisualComponent, Component);