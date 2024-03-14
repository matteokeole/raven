import {Event} from "./index.js";
import {Vector2} from "../../math/index.js";

/**
 * Wrapper for the DOM event "mousedown".
 * 
 * @extends {Event<Vector2>}
 */
export class MouseDownEvent extends Event {
	static NAME = "mouse_down";
}