import {Event} from "./index.js";

/**
 * Wrapper for the DOM event "keyup".
 * 
 * @extends {Event<import("./KeyPressEvent.js").KeyEventCarry>}
 */
export class KeyReleaseEvent extends Event {
	static NAME = "key_release";
}