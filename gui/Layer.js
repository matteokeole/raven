import {GUIComposite} from "./index.js";
import {Component} from "./Component/index.js";
import {NotImplementedError} from "../errors/index.js";

/**
 * @todo Replace by Component?
 * @abstract
 */
export class Layer {
	/**
	 * @abstract
	 * @param {GUIComposite} context
	 * @returns {Component}
	 */
	build(context) {
		throw new NotImplementedError();
	}
}