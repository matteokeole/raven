import {Component} from "./Component/index.js";
import {GUIComposite} from "../Composite/index.js";
import {NotImplementedError} from "../Error/index.js";

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