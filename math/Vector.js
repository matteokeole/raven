/**
 * Generic vector class.
 * 
 * @abstract
 * @throws {TypeError}
 */
export function Vector(argLength, currentArgLength) {
	if (currentArgLength < argLength) throw TypeError(`Failed to construct '${this.constructor.name}': ${argLength} arguments required, but only ${currentArgLength} present.`);
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
Vector.prototype.ceil;

/**
 * @abstract
 * @returns {Vector}
 */
Vector.prototype.clone;

/**
 * @abstract
 * @param {Vector} v
 * @returns {Number}
 */
Vector.prototype.distanceTo;

/**
 * @abstract
 * @param {Vector} v
 * @returns {Vector}
 * @throws {RangeError}
 */
Vector.prototype.divide;

/**
 * @param {Number} n
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
 * Only for 32-bit signed integers.
 * 
 * @abstract
 * @returns {Vector}
 */
Vector.prototype.floor32;

Vector.prototype.invert = function() {
	return this.multiplyScalar(-1);
};

Vector.prototype.length = function() {
	return Math.sqrt(this.lengthSquared());
};

/**
 * @abstract
 * @returns {Number}
 */
Vector.prototype.lengthSquared;

/**
 * @param {Vector} v
 * @param {Number} n
 */
Vector.prototype.lerp = function(v, n) {
	const a = this.multiplyScalar(1 - n);
	const b = v.multiplyScalar(n);

	return a.add(b);
};

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

Vector.prototype.normalize = function() {
	return this.divideScalar(this.length());
};

/**
 * @abstract
 * @returns {Vector}
 */
Vector.prototype.round;

/**
 * @abstract
 * @param {Vector} v
 * @returns {Vector}
 */
Vector.prototype.subtract;

/**
 * @param {Number} n
 */
Vector.prototype.subtractScalar = function(n) {
	return this.addScalar(-n);
};

/**
 * @abstract
 * @returns {Number[]}
 */
Vector.prototype.toArray;