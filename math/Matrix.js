/**
 * @abstract
 * @extends Float32Array
 */
export class Matrix extends Float32Array {
	/**
	 * @param {Number} dimension
	 * @param {Object} elements
	 */
	constructor(dimension, elements) {
		super(dimension).set(elements);
	}
}

/**
 * @abstract
 * @returns {Matrix}
 */
Matrix.prototype.clone;

/**
 * @abstract
 * @returns {Matrix3}
 */
Matrix.prototype.invert;

/**
 * @abstract
 * @param {Matrix} m
 * @returns {Matrix}
 */
Matrix.prototype.multiply;

/**
 * @abstract
 * @param {Number} n
 * @returns {Matrix}
 */
Matrix.prototype.multiplyScalar;

/**
 * @abstract
 * @returns {Matrix3}
 */
Matrix.prototype.transpose;

/**
 * @abstract
 * @returns {Matrix}
 */
Matrix.identity;

/**
 * @abstract
 * @param {Vector} v
 * @returns {Matrix}
 * @throws {RangeError}
 */
Matrix.orthographic;

/**
 * @abstract
 * @param {Vector} v
 * @returns {Matrix}
 */
Matrix.translation;

/**
 * @abstract
 * @param {Vector} v
 * @returns {Matrix}
 */
Matrix.scale;