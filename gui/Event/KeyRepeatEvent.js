import {Event} from "./index.js";

/**
 * Wrapper for the DOM event "keydown".
 * Note: Fired repeatedly after a `KeyPressEvent` was fired.
 * 
 * @extends {Event<String>}
 */
export class KeyRepeatEvent extends Event {
	static NAME = "key_repeat";
}