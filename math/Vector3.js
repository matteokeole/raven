import {Vector} from "./Vector.js";
import {extend} from "../utils/index.js";

/**
 * Tri-dimensional vector class.
 * 
 * @extends Vector
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */
export function Vector3(x, y, z) {
	Vector.call(this, 3, arguments.length);

	/** @type {Number} */
	this.x = x;

	/** @type {Number} */
	this.y = y;

	/** @type {Number} */
	this.z = z;
}

extend(Vector3, Vector);

/** @override */
Vector3.prototype.add = function(v) {
	return new Vector3(
		this.x + v.x,
		this.y + v.y,
		this.z + v.z,
	);
};

/** @override */
Vector3.prototype.addScalar = function(n) {
	return new Vector3(
		this.x + n,
		this.y + n,
		this.z + n,
	);
};

/** @override */
Vector3.prototype.ceil = function() {
	return new Vector3(
		Math.ceil(this.x),
		Math.ceil(this.y),
		Math.ceil(this.z),
	);
};

/** @override */
Vector3.prototype.clone = function() {
	return new Vector3(
		this.x,
		this.y,
		this.z,
	);
};

/**
 * @param {Vector3} v
 */
Vector3.prototype.cross = function(v) {
	return new Vector3(
		this.y * v.z - this.z * v.y,
		this.z * v.x - this.x * v.z,
		this.x * v.y - this.y * v.x,
	);
};

/** @override */
Vector3.prototype.distanceTo = function(v) {
	return Math.sqrt(
		(v.x - this.x) ** 2 +
		(v.y - this.y) ** 2 +
		(v.z - this.z) ** 2,
	);
};

/** @override */
Vector3.prototype.divide = function(v) {
	if (v.x === 0 || v.y === 0 || v.z === 0) throw RangeError("Division by zero");

	return new Vector3(
		this.x / v.x,
		this.y / v.y,
		this.z / v.z,
	);
};

/** @override */
Vector3.prototype.dot = function(v) {
	return this.x * v.x + this.y * v.y + this.z * v.z;
};

/** @override */
Vector3.prototype.floor = function() {
	return new Vector3(
		Math.floor(this.x),
		Math.floor(this.y),
		Math.floor(this.z),
	);
};

/** @override */
Vector3.prototype.floor32 = function() {
	return new Vector3(
		this.x | 0,
		this.y | 0,
		this.z | 0,
	);
};

/** @override */
Vector3.prototype.lengthSquared = function() {
	return this.x ** 2 + this.y ** 2 + this.z ** 2;
};

/** @override */
Vector3.prototype.multiply = function(v) {
	return new Vector3(
		this.x * v.x,
		this.y * v.y,
		this.z * v.z,
	);
};

/** @override */
Vector3.prototype.multiplyScalar = function(n) {
	return new Vector3(
		this.x * n,
		this.y * n,
		this.z * n,
	);
};

/** @override */
Vector3.prototype.round = function() {
	return new Vector3(
		Math.round(this.x),
		Math.round(this.y),
		Math.round(this.z),
	);
};

/** @override */
Vector3.prototype.subtract = function(v) {
	return new Vector3(
		this.x - v.x,
		this.y - v.y,
		this.z - v.z,
	);
};

/** @override */
Vector3.prototype.subtractScalar = function(n) {
	return this.addScalar(-n);
};

/** @override */
Vector3.prototype.toArray = function() {
	return [
		this.x,
		this.y,
		this.z,
	];
};