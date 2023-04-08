import {Vector2} from "./index.js";

/**
 * 3x3 matrix class.
 * 
 * @extends Array
 * @param {...Number} elements
 * @throws {TypeError}
 */
export function Matrix3(...elements) {
	const {length} = elements;

	if (length < 9) throw TypeError(`Failed to construct 'Matrix3': 9 arguments required, but only ${length} present.`);

	this?.push.apply(this, elements.slice(0, 9));
}

Matrix3.prototype = Array.prototype;

/**
 * @param {Vector2} v
 */
Matrix3.prototype.translate = function(v) {
	return this.multiplyMatrix3(Matrix3.translate(v));
};

/**
 * @param {Number} a Angle in radians
 */
Matrix3.prototype.rotate = function(a) {
	return this.multiplyMatrix3(Matrix3.rotate(a));
};

/**
 * @param {Vector2} v
 */
Matrix3.prototype.scale = function(v) {
	return this.multiplyMatrix3(Matrix3.scale(v));
};

/**
 * @param {Number} n
 */
Matrix3.prototype.multiplyScalar = function(n) {
	const m = this;

	return new Matrix3(
		m[0] * n, m[1] * n, m[2] * n,
		m[3] * n, m[4] * n, m[5] * n,
		m[6] * n, m[7] * n, m[8] * n,
	);
};

/**
 * @param {Matrix3} m
 */
Matrix3.prototype.multiplyMatrix3 = function(m) {
	const
		[a00, a10, a20, a01, a11, a21, a02, a12, a22] = this,
		[b00, b10, b20, b01, b11, b21, b02, b12, b22] = m;

	return new Matrix3(
		a00 * b00 + a01 * b10 + a02 * b20,
		a10 * b00 + a11 * b10 + a12 * b20,
		a20 * b00 + a21 * b10 + a22 * b20,
		a00 * b01 + a01 * b11 + a02 * b21,
		a10 * b01 + a11 * b11 + a12 * b21,
		a20 * b01 + a21 * b11 + a22 * b21,
		a00 * b02 + a01 * b12 + a02 * b22,
		a10 * b02 + a11 * b12 + a12 * b22,
		a20 * b02 + a21 * b12 + a22 * b22,
	);
};

Matrix3.prototype.invert = function() {
	const
		[a00, a10, a20, a01, a11, a21, a02, a12, a22] = this,
		b00 = a22 * a11 - a21 * a12,
		b01 = a21 * a02 - a22 * a01,
		b02 = a12 * a01 - a11 * a02,
		d = a00 * b00 + a10 * b01 + a20 * b02;

	if (d === 0) return new Matrix3(0, 0, 0, 0, 0, 0, 0, 0, 0);

	return new Matrix3(
		b00,
		a20 * a12 - a22 * a10,
		a21 * a10 - a20 * a11,
		b01,
		a22 * a00 - a20 * a02,
		a20 * a01 - a21 * a00,
		b02,
		a10 * a02 - a12 * a00,
		a11 * a00 - a10 * a01,
	).multiplyScalar(1 / d);
};

Matrix3.prototype.transpose = function() {
	const m = this;

	return new Matrix3(
		m[0], m[3], m[6],
		m[1], m[4], m[7],
		m[2], m[5], m[8],
	);
};

Matrix3.identity = () => new Matrix3(
	1, 0, 0,
	0, 1, 0,
	0, 0, 1,
);

/**
 * NOTE: Inverts the Y axis.
 * 
 * @param {Vector2} v
 * @throws {RangeError}
 */
Matrix3.projection = function(v) {
	const {x, y} = v;

	if (x === 0 || y === 0) throw RangeError("Division by zero");

	return new Matrix3(
		2 / x,  0,      0,
		0,     -2 / y,  0,
	   -1,      1,      1,
	);
};

/**
 * @param {Vector2} v
 */
Matrix3.translate = function(v) {
	const {x, y} = v;

	return new Matrix3(
		1, 0, 0,
		0, 1, 0,
		x, y, 1,
	);
};

/**
 * @param {Number} a Angle in radians
 */
Matrix3.rotate = function(a) {
	const s = Math.sin(a), c = Math.cos(a);

	return new Matrix3(
		c,  s,  0,
	   -s,  c,  0,
		0,  0,  1,
	);
};

/**
 * @param {Vector2} v
 */
Matrix3.scale = function(v) {
	const {x, y} = v;

	return new Matrix3(
		x, 0, 0,
		0, y, 0,
		0, 0, 1,
	);
};