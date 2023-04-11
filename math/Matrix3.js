import {Matrix} from "./index.js";

/** @extends Matrix */
export class Matrix3 extends Matrix {
	/** @param {...Number} elements */
	constructor() {
		super(9, arguments);
	}
}

/** @override */
Matrix3.prototype.clone = function() {
	return new Matrix3(this[0], this[1], this[2], this[3], this[4], this[5], this[6], this[7], this[8]);
};

/** @override */
Matrix3.prototype.invert = function() {
	const
		a00 = this[0],
		a10 = this[1],
		a20 = this[2],
		a01 = this[3],
		a11 = this[4],
		a21 = this[5],
		a02 = this[6],
		a12 = this[7],
		a22 = this[8],
		b00 = a22 * a11 - a21 * a12,
		b01 = a21 * a02 - a22 * a01,
		b02 = a12 * a01 - a11 * a02,
		d = a00 * b00 + a10 * b01 + a20 * b02;

	if (d === 0) return new Matrix3();

	this[0] = b00;
	this[1] = a20 * a12 - a22 * a10;
	this[2] = a21 * a10 - a20 * a11;
	this[3] = b01;
	this[4] = a22 * a00 - a20 * a02;
	this[5] = a20 * a01 - a21 * a00;
	this[6] = b02;
	this[7] = a10 * a02 - a12 * a00;
	this[8] = a11 * a00 - a10 * a01;

	return this.multiplyScalar(1 / d);
};

/** @override */
Matrix3.prototype.multiply = function(m) {
	const
		a00 = this[0],
		a10 = this[1],
		a20 = this[2],
		a01 = this[3],
		a11 = this[4],
		a21 = this[5],
		a02 = this[6],
		a12 = this[7],
		a22 = this[8],
		b00 = m[0],
		b10 = m[1],
		b20 = m[2],
		b01 = m[3],
		b11 = m[4],
		b21 = m[5],
		b02 = m[6],
		b12 = m[7],
		b22 = m[8];

	this[0] = a00 * b00 + a01 * b10 + a02 * b20;
	this[1] = a10 * b00 + a11 * b10 + a12 * b20;
	this[2] = a20 * b00 + a21 * b10 + a22 * b20;
	this[3] = a00 * b01 + a01 * b11 + a02 * b21;
	this[4] = a10 * b01 + a11 * b11 + a12 * b21;
	this[5] = a20 * b01 + a21 * b11 + a22 * b21;
	this[6] = a00 * b02 + a01 * b12 + a02 * b22;
	this[7] = a10 * b02 + a11 * b12 + a12 * b22;
	this[8] = a20 * b02 + a21 * b12 + a22 * b22;

	return this;
};

/** @override */
Matrix3.prototype.multiplyScalar = function(n) {
	this[0] *= n;
	this[1] *= n;
	this[2] *= n;
	this[3] *= n;
	this[4] *= n;
	this[5] *= n;
	this[6] *= n;
	this[7] *= n;
	this[8] *= n;

	return this;
};

/** @override */
Matrix3.prototype.transpose = function() {
	let e = this[1];
	this[1] = this[3];
	this[3] = e;
	e = this[2];
	this[2] = this[6];
	this[6] = e;
	e = this[5];
	this[5] = this[7];
	this[7] = e;

	return this;
};

/** @override */
Matrix3.identity = () => new Matrix3(
	1, 0, 0,
	0, 1, 0,
	0, 0, 1,
);

/** @override */
Matrix3.orthographic = function(v) {
	if (v[0] === 0 || v[1] === 0) throw RangeError("Division by zero");

	return new Matrix3(
		2 / v[0], 0, 0,
		0, -2 / v[1], 0,
		-1, 1, 1,
	);
};

/** @override */
Matrix3.translation = v => new Matrix3(
	1, 0, 0,
	0, 1, 0,
	v[0], v[1], 1,
);

/** @override */
Matrix3.scale = v => new Matrix3(
	v[0], 0, 0,
	0, v[1], 0,
	0, 0, 1,
);