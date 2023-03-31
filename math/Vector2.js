import {Vector} from "./Vector.js";
import {extend} from "../utils/index.js";

/**
 * Bi-dimensional vector class.
 * 
 * @extends Vector
 * @param {Number} x
 * @param {Number} y
 */
export function Vector2(x, y) {
	Vector.call(this, 2, arguments.length);

	/** @type {Number} */
	this.x = x;

	/** @type {Number} */
	this.y = y;
}

extend(Vector2, Vector);

/** @override */
Vector2.prototype.add = function(v) {
	return new Vector2(
		this.x + v.x,
		this.y + v.y,
	);
};

/** @override */
Vector2.prototype.addScalar = function(n) {
	return new Vector2(
		this.x + n,
		this.y + n,
	);
};

/** @override */
Vector2.prototype.ceil = function() {
	return new Vector2(
		Math.ceil(this.x),
		Math.ceil(this.y),
	);
};

/** @override */
Vector2.prototype.clone = function() {
	return new Vector2(
		this.x,
		this.y,
	);
};

/** @override */
Vector2.prototype.distanceTo = function(v) {
	return Math.sqrt(
		(v.x - this.x) ** 2 +
		(v.y - this.y) ** 2,
	);
};

/** @override */
Vector2.prototype.divide = function(v) {
	if (v.x === 0 || v.y === 0) throw RangeError("Division by zero");

	return new Vector2(
		this.x / v.x,
		this.y / v.y,
	);
};

/** @override */
Vector2.prototype.dot = function(v) {
	return this.x * v.x + this.y * v.y;
};

/** @override */
Vector2.prototype.floor = function() {
	return new Vector2(
		Math.floor(this.x),
		Math.floor(this.y),
	);
};

/** @override */
Vector2.prototype.floor32 = function() {
	return new Vector2(
		this.x | 0,
		this.y | 0,
	);
};

/** @override */
Vector2.prototype.lengthSquared = function() {
	return this.x ** 2 + this.y ** 2;
};

/** @override */
Vector2.prototype.multiply = function(v) {
	return new Vector2(
		this.x * v.x,
		this.y * v.y,
	);
};

/** @override */
Vector2.prototype.multiplyScalar = function(n) {
	return new Vector2(
		this.x * n,
		this.y * n,
	);
};

/** @override */
Vector2.prototype.round = function() {
	return new Vector2(
		Math.round(this.x),
		Math.round(this.y),
	);
};

/** @override */
Vector2.prototype.subtract = function(v) {
	return new Vector2(
		this.x - v.x,
		this.y - v.y,
	);
};

/** @override */
Vector2.prototype.toArray = function() {
	return [
		this.x,
		this.y,
	];
};