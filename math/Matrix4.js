import {Matrix} from "./index.js";

/** @extends Matrix */
export class Matrix4 extends Matrix {
	/** @param {...Number} elements */
	constructor() {
		super(16, arguments);
	}
}

/** @override */
Matrix4.prototype.clone = function() {
	return new Matrix4(this[0], this[1], this[2], this[3], this[4], this[5], this[6], this[7], this[8], this[9], this[10], this[11], this[12], this[13], this[14], this[15]);
};

/** @override */
Matrix4.prototype.invert = function() {
	const
		a00 = this[0],
		a10 = this[1],
		a20 = this[2],
		a30 = this[3],
		a01 = this[4],
		a11 = this[5],
		a21 = this[6],
		a31 = this[7],
		a02 = this[8],
		a12 = this[9],
		a22 = this[10],
		a32 = this[11],
		a03 = this[12],
		a13 = this[13],
		a23 = this[14],
		a33 = this[15],
		b00 = a12 * a23 * a31 - a13 * a22 * a31 + a13 * a21 * a32 - a11 * a23 * a32 - a12 * a21 * a33 + a11 * a22 * a33,
		b01 = a03 * a22 * a31 - a02 * a23 * a31 - a03 * a21 * a32 + a01 * a23 * a32 + a02 * a21 * a33 - a01 * a22 * a33,
		b02 = a02 * a13 * a31 - a03 * a12 * a31 + a03 * a11 * a32 - a01 * a13 * a32 - a02 * a11 * a33 + a01 * a12 * a33,
		b03 = a03 * a12 * a21 - a02 * a13 * a21 - a03 * a11 * a22 + a01 * a13 * a22 + a02 * a11 * a23 - a01 * a12 * a23,
		d = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;

	if (d === 0) return new Matrix4();

	this[0] = b00;
	this[1] = a13 * a22 * a30 - a12 * a23 * a30 - a13 * a20 * a32 + a10 * a23 * a32 + a12 * a20 * a33 - a10 * a22 * a33;
	this[2] = a11 * a23 * a30 - a13 * a21 * a30 + a13 * a20 * a31 - a10 * a23 * a31 - a11 * a20 * a33 + a10 * a21 * a33;
	this[3] = a12 * a21 * a30 - a11 * a22 * a30 - a12 * a20 * a31 + a10 * a22 * a31 + a11 * a20 * a32 - a10 * a21 * a32;
	this[4] = b01;
	this[5] = a02 * a23 * a30 - a03 * a22 * a30 + a03 * a20 * a32 - a00 * a23 * a32 - a02 * a20 * a33 + a00 * a22 * a33;
	this[6] = a03 * a21 * a30 - a01 * a23 * a30 - a03 * a20 * a31 + a00 * a23 * a31 + a01 * a20 * a33 - a00 * a21 * a33;
	this[7] = a01 * a22 * a30 - a02 * a21 * a30 + a02 * a20 * a31 - a00 * a22 * a31 - a01 * a20 * a32 + a00 * a21 * a32;
	this[8] = b02;
	this[9] = a03 * a12 * a30 - a02 * a13 * a30 - a03 * a10 * a32 + a00 * a13 * a32 + a02 * a10 * a33 - a00 * a12 * a33;
	this[10] = a01 * a13 * a30 - a03 * a11 * a30 + a03 * a10 * a31 - a00 * a13 * a31 - a01 * a10 * a33 + a00 * a11 * a33;
	this[11] = a02 * a11 * a30 - a01 * a12 * a30 - a02 * a10 * a31 + a00 * a12 * a31 + a01 * a10 * a32 - a00 * a11 * a32;
	this[12] = b03;
	this[13] = a02 * a13 * a20 - a03 * a12 * a20 + a03 * a10 * a22 - a00 * a13 * a22 - a02 * a10 * a23 + a00 * a12 * a23;
	this[14] = a03 * a11 * a20 - a01 * a13 * a20 - a03 * a10 * a21 + a00 * a13 * a21 + a01 * a10 * a23 - a00 * a11 * a23;
	this[15] = a01 * a12 * a20 - a02 * a11 * a20 + a02 * a10 * a21 - a00 * a12 * a21 - a01 * a10 * a22 + a00 * a11 * a22;

	return this.multiplyScalar(1 / d);
};

/** @override */
Matrix4.prototype.multiply = function(m) {
	const
		a00 = this[0],
		a10 = this[1],
		a20 = this[2],
		a30 = this[3],
		a01 = this[4],
		a11 = this[5],
		a21 = this[6],
		a31 = this[7],
		a02 = this[8],
		a12 = this[9],
		a22 = this[10],
		a32 = this[11],
		a03 = this[12],
		a13 = this[13],
		a23 = this[14],
		a33 = this[15],
		b00 = m[0],
		b10 = m[1],
		b20 = m[2],
		b30 = m[3],
		b01 = m[4],
		b11 = m[5],
		b21 = m[6],
		b31 = m[7],
		b02 = m[8],
		b12 = m[9],
		b22 = m[10],
		b32 = m[11],
		b03 = m[12],
		b13 = m[13],
		b23 = m[14],
		b33 = m[15];

	this[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
	this[1] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
	this[2] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
	this[3] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
	this[4] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
	this[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
	this[6] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
	this[7] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
	this[8] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
	this[9] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
	this[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
	this[11] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
	this[12] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
	this[13] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
	this[14] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
	this[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

	return this;
};

/** @override */
Matrix4.prototype.multiplyScalar = function(n) {
	this[0] *= n;
	this[1] *= n;
	this[2] *= n;
	this[3] *= n;
	this[4] *= n;
	this[5] *= n;
	this[6] *= n;
	this[7] *= n;
	this[8] *= n;
	this[9] *= n;
	this[10] *= n;
	this[11] *= n;
	this[12] *= n;
	this[13] *= n;
	this[14] *= n;
	this[15] *= n;

	return this;
};

/** @override */
Matrix4.prototype.transpose = function() {
	let e = this[1];
	this[1] = this[4];
	this[4] = e;
	e = this[2];
	this[2] = this[8];
	this[8] = e;
	e = this[3];
	this[3] = this[12];
	this[12] = e;
	e = this[6];
	this[6] = this[9];
	this[9] = e;
	e = this[7];
	this[7] = this[13];
	this[13] = e;
	e = this[11];
	this[11] = this[14];
	this[14] = e;

	return this;
};

/** @override */
Matrix4.identity = () => new Matrix4(
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1,
);

/** @override */
Matrix4.orthographic = function(v) {
	if (v[0] === 0 || v[1] === 0 || v[2] === 0) throw RangeError("Division by zero");

	return new Matrix4(
		2 / v[0], 0, 0, 0,
		0, 2 / v[1], 0, 0,
		0, 0, 2 / v[2], 0,
		-1, 1, 0, 1,
	);
};

/** @override */
Matrix4.translation = v => new Matrix4(
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	v[0], v[1], v[2], 1,
);

/** @override */
Matrix4.scale = v => new Matrix4(
	v[0], 0, 0, 0,
	0, v[1], 0, 0,
	0, 0, v[2], 0,
	0, 0, 0, 1,
);