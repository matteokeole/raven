export function Layer() {}

/**
 * @todo Return an array of components or a single component?
 * 
 * @abstract
 * @returns {Component[]}
 */
Layer.prototype.build;

Layer.prototype.dispose = () => {};