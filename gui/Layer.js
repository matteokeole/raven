import {Component} from "./components/index.js";
import {Composite} from "../index.js";

/**
 * @todo Replace by Component?
 * @abstract
 */
export class Layer {
	/**
	 * @todo Return a single component instead of an array; this will also simplify the compute step in the composite
	 * 
	 * @abstract
	 * @param {Composite} context
	 * @returns {Component[]}
	 */
	build(context) {
		throw new Error("Not implemented");
	}
}