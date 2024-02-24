import {Event} from "../../src/gui/Event/index.js";

/**
 * @extends {Event<Number>}
 */
export class IncrementCountEvent extends Event {
	static NAME = "increment_count";
}