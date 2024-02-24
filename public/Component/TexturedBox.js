import {GUIComposite, Subcomponent} from "../../src/gui/index.js";
import {VisualComponent} from "../../src/gui/Component/index.js";
import {MouseDownEvent} from "../../src/gui/Event/index.js";
import {Vector2, intersects} from "../../src/math/index.js";
import {IncrementCountEvent} from "../Event/IncrementCountEvent.js";

export class TexturedBox extends VisualComponent {
	/**
	 * @type {Number}
	 */
	#count;

	/**
	 * @param {import("../../src/gui/Component/VisualComponent.js").VisualComponentDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.#count = 0;

		this.setSubcomponents([
			new Subcomponent({
				size: this.getSize(),
			}),
		]);
	}

	/**
	 * @param {Vector2} carry
	 * @param {GUIComposite} context
	 */
	[MouseDownEvent.NAME](carry, context) {
		if (!intersects(carry, this.getPosition(), this.getSize())) {
			return;
		}

		this.#count++;

		this.dispatchEvent(new IncrementCountEvent(this.#count));
	}
}