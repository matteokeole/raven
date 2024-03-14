import {Event} from "./index.js";
import {Vector2} from "../../math/index.js";

/**
 * Wrapper for the DOM event "mousemove".
 * 
 * @extends {Event<Vector2>}
 */
export class MouseMoveEvent extends Event {
	static NAME = "mouse_move";
}