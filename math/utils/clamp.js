/**
 * @param {Number} n
 * @param {Number} min
 * @param {Number} max
 */
export function clamp(n, min, max) {
	if (n < min) return min;
	if (n > max) return max;

	return n;
}

/**
 * @param {Number} n
 * @param {Number} min
 */
export const clampDown = (n, min) => n < min ? min : n;

/**
 * @param {Number} n
 * @param {Number} max
 */
export const clampUp = (n, max) => n > max ? max : n;