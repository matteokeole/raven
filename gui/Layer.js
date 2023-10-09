import {Component} from "./components/index.js";
import {GUIComposite} from "./index.js";

/**
 * @abstract
 */
export class Layer {
	/**
	 * @abstract
	 * @param {GUIComposite} context
	 * @returns {Component[]}
	 */
	build() {}
}