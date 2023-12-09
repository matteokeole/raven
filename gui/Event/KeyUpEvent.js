import {Event} from "./index.js";

/**
 * Wrapper for the DOM event "keyup".
 * 
 * @extends {Event<String>}
 */
export class KeyUpEvent extends Event {
	static NAME = "key_up";
}