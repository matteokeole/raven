import {Component, GUIComposite} from "./index.js";

/** @abstract */
export class Layer {
	/**
	 * @abstract
	 * @param {GUIComposite} context
	 * @returns {Component[]}
	 */
	build() {}
}