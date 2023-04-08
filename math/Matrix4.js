import {Vector3} from "./index.js";

/**
 * 4x4 matrix class.
 * 
 * @extends Array
 * @param {...Number} elements
 * @throws {TypeError}
 */
export function Matrix4(...elements) {
	const {length} = elements;

	if (length < 16) throw TypeError(`Failed to construct 'Matrix4': 16 arguments required, but only ${length} present.`);

	this?.push.apply(this, elements.slice(0, 16));
}

Matrix4.prototype = Array.prototype;

/**
 * @param {Number} n
 */
Matrix4.prototype.multiplyScalar = function(n) {
	const m = this;

	return new Matrix4(
		m[0] * n,  m[1] * n,  m[2] * n,  m[3] * n,
		m[4] * n,  m[5] * n,  m[6] * n,  m[7] * n,
		m[8] * n,  m[9] * n,  m[10] * n, m[11] * n,
		m[12] * n, m[13] * n, m[14] * n, m[15] * n,
	);
};

/**
 * @param {Matrix4} m
 */
Matrix4.prototype.multiplyMatrix4 = function(m) {
	const
		[a00, a10, a20, a30, a01, a11, a21, a31, a02, a12, a22, a32, a03, a13, a23, a33] = this,
		[b00, b10, b20, b30, b01, b11, b21, b31, b02, b12, b22, b32, b03, b13, b23, b33] = m;

	return new Matrix4(
		a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
		a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
		a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
		a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
		a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
		a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
		a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
		a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
		a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
		a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
		a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
		a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
		a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
		a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
		a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
		a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33,
	);
};

Matrix4.prototype.invert = function() {
	const
		[a00, a10, a20, a30, a01, a11, a21, a31, a02, a12, a22, a32, a03, a13, a23, a33] = this,
		b00 = a12 * a23 * a31 - a13 * a22 * a31 + a13 * a21 * a32 - a11 * a23 * a32 - a12 * a21 * a33 + a11 * a22 * a33,
		b01 = a03 * a22 * a31 - a02 * a23 * a31 - a03 * a21 * a32 + a01 * a23 * a32 + a02 * a21 * a33 - a01 * a22 * a33,
		b02 = a02 * a13 * a31 - a03 * a12 * a31 + a03 * a11 * a32 - a01 * a13 * a32 - a02 * a11 * a33 + a01 * a12 * a33,
		b03 = a03 * a12 * a21 - a02 * a13 * a21 - a03 * a11 * a22 + a01 * a13 * a22 + a02 * a11 * a23 - a01 * a12 * a23,
		d = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;

	if (0 === d) return new Matrix4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

	return new Matrix4(
		b00,
		a13 * a22 * a30 - a12 * a23 * a30 - a13 * a20 * a32 + a10 * a23 * a32 + a12 * a20 * a33 - a10 * a22 * a33,
		a11 * a23 * a30 - a13 * a21 * a30 + a13 * a20 * a31 - a10 * a23 * a31 - a11 * a20 * a33 + a10 * a21 * a33,
		a12 * a21 * a30 - a11 * a22 * a30 - a12 * a20 * a31 + a10 * a22 * a31 + a11 * a20 * a32 - a10 * a21 * a32,
		b01,
		a02 * a23 * a30 - a03 * a22 * a30 + a03 * a20 * a32 - a00 * a23 * a32 - a02 * a20 * a33 + a00 * a22 * a33,
		a03 * a21 * a30 - a01 * a23 * a30 - a03 * a20 * a31 + a00 * a23 * a31 + a01 * a20 * a33 - a00 * a21 * a33,
		a01 * a22 * a30 - a02 * a21 * a30 + a02 * a20 * a31 - a00 * a22 * a31 - a01 * a20 * a32 + a00 * a21 * a32,
		b02,
		a03 * a12 * a30 - a02 * a13 * a30 - a03 * a10 * a32 + a00 * a13 * a32 + a02 * a10 * a33 - a00 * a12 * a33,
		a01 * a13 * a30 - a03 * a11 * a30 + a03 * a10 * a31 - a00 * a13 * a31 - a01 * a10 * a33 + a00 * a11 * a33,
		a02 * a11 * a30 - a01 * a12 * a30 - a02 * a10 * a31 + a00 * a12 * a31 + a01 * a10 * a32 - a00 * a11 * a32,
		b03,
		a02 * a13 * a20 - a03 * a12 * a20 + a03 * a10 * a22 - a00 * a13 * a22 - a02 * a10 * a23 + a00 * a12 * a23,
		a03 * a11 * a20 - a01 * a13 * a20 - a03 * a10 * a21 + a00 * a13 * a21 + a01 * a10 * a23 - a00 * a11 * a23,
		a01 * a12 * a20 - a02 * a11 * a20 + a02 * a10 * a21 - a00 * a12 * a21 - a01 * a10 * a22 + a00 * a11 * a22,
	).multiplyScalar(1 / d);
};

Matrix4.prototype.transpose = function() {
	const m = this;

	return new Matrix4(
		m[0],  m[4],  m[8],  m[12],
		m[1],  m[5],  m[9],  m[13],
		m[2],  m[6],  m[10], m[14],
		m[3],  m[7],  m[11], m[15],
	);
};

Matrix4.identity = () => new Matrix4(
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1,
);

/**
 * @param {Number} l Left
 * @param {Number} r Right
 * @param {Number} t Top
 * @param {Number} b Bottom
 * @param {Number} n Near
 * @param {Number} f Far
 * @throws {RangeError}
 */
Matrix4.orthographic = function(l, r, t, b, n, f) {
	const nmf = n - f;

	if (r - l === 0 || t - b === 0 || l - r === 0 || b - t === 0 || nmf === 0) throw RangeError("Division by zero");

	return new Matrix4(
		2 / (r - l), 0, 0, 0,
		0, 2 / (t - b), 0, 0,
		0, 0, 2 / nmf, 0,
		(l + r) / (l - r), (b + t) / (b - t), (n + f) / nmf, 1,
	);
};

/**
 * @param {Vector3} v
 */
Matrix4.translate = function(v) {
	const {x, y, z} = v;

	return new Matrix4(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		x, y, z, 1,
	);
};

/**
 * @param {Number} a Angle in radians
 */
Matrix4.rotationX = function(a) {
	const s = Math.sin(a), c = Math.cos(a);

	return new Matrix4(
		1,  0,  0,  0,
		0,  c,  s,  0,
		0, -s,  c,  0,
		0,  0,  0,  1,
	);
};

/**
 * @param {Number} a Angle in radians
 */
Matrix4.rotationY = function(a) {
	const s = Math.sin(a), c = Math.cos(a);

	return new Matrix4(
		c,  0, -s,  0,
		0,  1,  0,  0,
		s,  0,  c,  0,
		0,  0,  0,  1,
	);
};

/**
 * @param {Number} a Angle in radians
 */
Matrix4.rotationZ = function(a) {
	const s = Math.sin(a), c = Math.cos(a);

	return new Matrix4(
		c,  s,  0,  0,
	   -s,  c,  0,  0,
		0,  0,  1,  0,
		0,  0,  0,  1,
	);
};

/**
 * @param {Vector3} v
 */
Matrix4.scale = function(v) {
	const {x, y, z} = v;

	return new Matrix4(
		x, 0, 0, 0,
		0, y, 0, 0,
		0, 0, z, 0,
		0, 0, 0, 1,
	);
};