import {Vector} from "./index.js";

/** @extends Vector */
export class Vector2 extends Vector {
	/**
	 * @param {Number} [x]
	 * @param {Number} [y]
	 */
	constructor() {
		super(2, arguments);
	}
}

/** @override */
Vector2.prototype.add = function(v) {
	this[0] += v[0];
	this[1] += v[1];

	return this;
};

/** @override */
Vector2.prototype.addScalar = function(n) {
	this[0] += n;
	this[1] += n;

	return this;
};

/** @override */
Vector2.prototype.clone = function() {
	return new Vector2(this[0], this[1]);
};

/** @override */
Vector2.prototype.divide = function(v) {
	if (v[0] === 0 || v[1] === 0) throw RangeError("Division by zero");

	this[0] /= v[0];
	this[1] /= v[1];

	return this;
};

/** @override */
Vector2.prototype.dot = function(v) {
	return this[0] * v[0] + this[1] * v[1];
};

/** @override */
Vector2.prototype.floor = function() {
	this[0] |= 0;
	this[1] |= 0;

	return this;
};

/** @override */
Vector2.prototype.multiply = function(v) {
	this[0] *= v[0];
	this[1] *= v[1];

	return this;
};

/** @override */
Vector2.prototype.multiplyScalar = function(n) {
	this[0] *= n;
	this[1] *= n;

	return this;
};

/** @override */
Vector2.prototype.subtract = function(v) {
	this[0] -= v[0];
	this[1] -= v[1];

	return this;
};