import {NotImplementedError} from "../errors/index.js";

export function Layer() {}

/**
 * @todo Return an array of components or a single component?
 * 
 * @returns {Component[]}
 */
Layer.prototype.build = function() {
	throw new NotImplementedError();
};

Layer.prototype.dispose = () => {};