/**
 * @abstract
 */
export class Alignment {
	/**
	 * @type {Number}
	 */
	static topLeft = 0b001001;

	/**
	 * @type {Number}
	 */
	static topCenter = 0b010001;

	/**
	 * @type {Number}
	 */
	static topRight = 0b100001;

	/**
	 * @type {Number}
	 */
	static centerLeft = 0b001010;

	/**
	 * @type {Number}
	 */
	static center = 0b010010;

	/**
	 * @type {Number}
	 */
	static centerRight = 0b100010;

	/**
	 * @type {Number}
	 */
	static bottomLeft = 0b001100;

	/**
	 * @type {Number}
	 */
	static bottomCenter = 0b010100;

	/**
	 * @type {Number}
	 */
	static bottomRight = 0b100100;
}