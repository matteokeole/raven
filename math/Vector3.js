import {Vector} from "./index.js";

/** @extends Vector */
export class Vector3 extends Vector {
	/**
	 * @param {Number} [x]
	 * @param {Number} [y]
	 * @param {Number} [z]
	 */
	constructor() {
		super(3, arguments);
	}
}

/** @override */
Vector3.prototype.add = function(v) {
	this[0] += v[0];
	this[1] += v[1];
	this[2] += v[2];

	return this;
};

/** @override */
Vector3.prototype.addScalar = function(n) {
	this[0] += n;
	this[1] += n;
	this[2] += n;

	return this;
};

/** @override */
Vector3.prototype.clone = function() {
	return new Vector3(this[0], this[1], this[2]);
};

/**
 * @param {Vector3} v
 * @returns {Vector3}
 */
Vector3.prototype.cross = function(v) {
	return new Vector3(
		this[1] * v[2] - this[2] * v[1],
		this[2] * v[0] - this[0] * v[2],
		this[0] * v[1] - this[1] * v[0],
	);
};

/** @override */
Vector3.prototype.divide = function(v) {
	if (v[0] === 0 || v[1] === 0 || v[2] === 0) throw RangeError("Division by zero");

	this[0] /= v[0];
	this[1] /= v[1];
	this[2] /= v[2];

	return this;
};

/** @override */
Vector3.prototype.dot = function(v) {
	return this[0] * v[0] + this[1] * v[1] + this[2] * v[2];
};

/** @override */
Vector3.prototype.floor = function() {
	this[0] |= 0;
	this[1] |= 0;
	this[2] |= 0;

	return this;
};

/** @override */
Vector3.prototype.multiply = function(v) {
	this[0] *= v[0];
	this[1] *= v[1];
	this[2] *= v[2];

	return this;
};

/** @override */
Vector3.prototype.multiplyScalar = function(n) {
	this[0] *= n;
	this[1] *= n;
	this[2] *= n;

	return this;
};

/** @override */
Vector3.prototype.subtract = function(v) {
	this[0] -= v[0];
	this[1] -= v[1];
	this[2] -= v[2];

	return this;
};