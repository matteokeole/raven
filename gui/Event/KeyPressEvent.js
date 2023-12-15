import {Event} from "./index.js";

/**
 * Wrapper for the DOM event "keydown".
 * Note: Fired only once per key press.
 * 
 * @extends {Event<String>}
 */
export class KeyPressEvent extends Event {
	static NAME = "key_press";
}