import {Vector2} from "../index.js";

/**
 * @param {Vector2} point
 * @param {Vector2} boxPosition
 * @param {Vector2} boxSize
 */
export const intersects = (point, boxPosition, boxSize) => (
	point.x >= boxPosition.x &&
	point.x < boxPosition.x + boxSize.x &&
	point.y >= boxPosition.y &&
	point.y < boxPosition.y + boxSize.y
);