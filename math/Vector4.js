import {Vector} from "./index.js";

/** @extends Vector */
export class Vector4 extends Vector {
	/**
	 * @param {Number} [x]
	 * @param {Number} [y]
	 * @param {Number} [z]
	 * @param {Number} [w]
	 */
	constructor() {
		super(4, arguments);
	}
}

/** @override */
Vector4.prototype.add = function(v) {
	this[0] += v[0];
	this[1] += v[1];
	this[2] += v[2];
	this[3] += v[3];

	return this;
};

/** @override */
Vector4.prototype.addScalar = function(n) {
	this[0] += n;
	this[1] += n;
	this[2] += n;
	this[3] += n;

	return this;
};

/** @override */
Vector4.prototype.clone = function() {
	return new Vector4(this[0], this[1], this[2], this[3]);
};

/** @override */
Vector4.prototype.divide = function(v) {
	if (v[0] === 0 || v[1] === 0 || v[2] === 0 || v[3] === 0) throw RangeError("Division by zero");

	this[0] /= v[0];
	this[1] /= v[1];
	this[2] /= v[2];
	this[3] /= v[3];

	return this;
};

/** @override */
Vector4.prototype.dot = function(v) {
	return this[0] * v[0] + this[1] * v[1] + this[2] * v[2] + this[3] * v[3];
};

/** @override */
Vector4.prototype.floor = function() {
	this[0] |= 0;
	this[1] |= 0;
	this[2] |= 0;
	this[3] |= 0;

	return this;
};

/** @override */
Vector4.prototype.multiply = function(v) {
	this[0] *= v[0];
	this[1] *= v[1];
	this[2] *= v[2];
	this[3] *= v[3];

	return this;
};

/** @override */
Vector4.prototype.multiplyScalar = function(n) {
	this[0] *= n;
	this[1] *= n;
	this[2] *= n;
	this[3] *= n;

	return this;
};

/** @override */
Vector4.prototype.subtract = function(v) {
	this[0] -= v[0];
	this[1] -= v[1];
	this[2] -= v[2];
	this[3] -= v[3];

	return this;
};