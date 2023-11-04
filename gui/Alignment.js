/**
 * @todo Describe how behaves the margin relative to the component alignment?
 * @todo Alignment typedef?
 * 
 * @abstract
 */
export class Alignment {
	/**
	 * Aligns the component to the top left corner of its parent.
	 * 
	 * @type {Number}
	 */
	static TOP_LEFT = 0b001001;

	/**
	 * Aligns the component to the top side of its parent and centers it horizontally.
	 * 
	 * @type {Number}
	 */
	static TOP_CENTER = 0b010001;

	/**
	 * Aligns the component to the top right corner of its parent.
	 * 
	 * @type {Number}
	 */
	static TOP_RIGHT = 0b100001;

	/**
	 * Aligns the component to the left side of its parent and centers it vertically.
	 * 
	 * @type {Number}
	 */
	static CENTER_LEFT = 0b001010;

	/**
	 * Centers the component horizontally and vertically relative to its parent.
	 * 
	 * @type {Number}
	 */
	static CENTER = 0b010010;

	/**
	 * Aligns the component to the right side of its parent and centers it vertically.
	 * 
	 * @type {Number}
	 */
	static CENTER_RIGHT = 0b100010;

	/**
	 * Aligns the component to the bottom left corner of its parent.
	 * 
	 * @type {Number}
	 */
	static BOTTOM_LEFT = 0b001100;

	/**
	 * Aligns the component to the bottom side of its parent and centers it horizontally.
	 * 
	 * @type {Number}
	 */
	static BOTTOM_CENTER = 0b010100;

	/**
	 * Aligns the component to the bottom right corner of its parent.
	 * 
	 * @type {Number}
	 */
	static BOTTOM_RIGHT = 0b100100;
}