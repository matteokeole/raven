import {Component} from "./components/index.js";
import {Composite} from "../index.js";

/**
 * @todo Replace by Component?
 * @abstract
 */
export class Layer {
	/**
	 * @abstract
	 * @param {Composite} context
	 * @returns {Component[]}
	 */
	build(context) {
		throw new Error("Not implemented");
	}
}