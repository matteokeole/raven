/**
 * @abstract
 * @extends Float32Array
 */
export class Vector extends Float32Array {
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
 * @param {Vector} v
 * @returns {Vector}
 */
Vector.prototype.add;

/**
 * @abstract
 * @param {Number} n
 * @returns {Vector}
 */
Vector.prototype.addScalar;

/**
 * @abstract
 * @returns {Vector}
 */
Vector.prototype.clone;

/**
 * @abstract
 * @param {Vector} v
 * @returns {Vector}
 * @throws {RangeError}
 */
Vector.prototype.divide;

/**
 * @param {Number} n
 * @returns {Vector}
 * @throws {RangeError}
 */
Vector.prototype.divideScalar = function(n) {
	if (n === 0) throw RangeError("Division by zero");

	return this.multiplyScalar(1 / n);
};

/**
 * @abstract
 * @param {Vector} v
 * @returns {Number}
 */
Vector.prototype.dot;

/**
 * @abstract
 * @returns {Vector}
 */
Vector.prototype.floor;

/**
 * @abstract
 * @param {Vector} v
 * @param {Number} n
 * @returns {Vector}
 */
Vector.prototype.lerp;

/**
 * @abstract
 * @param {Vector} v
 * @returns {Vector}
 */
Vector.prototype.multiply;

/**
 * @abstract
 * @param {Number} n
 * @returns {Vector}
 */
Vector.prototype.multiplyScalar;

/**
 * @abstract
 * @param {Vector} v
 * @returns {Vector}
 */
Vector.prototype.subtract;

/**
 * @param {Number} n
 * @returns {Vector}
 */
Vector.prototype.subtractScalar = function(n) {
	return this.addScalar(-n);
};