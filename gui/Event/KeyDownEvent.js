import {Event} from "./index.js";

/**
 * Wrapper for the DOM event "keydown".
 * 
 * @extends {Event<String>}
 */
export class KeyDownEvent extends Event {
	static NAME = "key_down";
}