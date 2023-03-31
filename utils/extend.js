/**
 * @param {Object} child
 * @param {Object} parent
 */
export function extend(child, parent) {
	child.prototype = Object.create(parent.prototype);
	child.prototype.constructor = child;
}