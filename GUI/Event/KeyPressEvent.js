import {Event} from "./index.js";

/**
 * @typedef {Object} KeyEventCarry
 * @property {String} key
 * @property {String} code
 */

/**
 * Wrapper for the DOM event "keydown".
 * Note: Fired only once per key press.
 * 
 * @extends {Event<KeyEventCarry>}
 */
export class KeyPressEvent extends Event {
	static NAME = "key_press";
}