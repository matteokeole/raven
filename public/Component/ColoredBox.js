import {Subcomponent} from "../../src/gui/index.js";
import {VisualComponent} from "../../src/gui/Component/index.js";

export class ColoredBox extends VisualComponent {
	/**
	 * @param {import("../../src/gui/Component/VisualComponent.js").VisualComponentDescriptor} descriptor
	 */
	constructor(descriptor) {
		super(descriptor);

		this.setSubcomponents([
			new Subcomponent({
				size: this.getSize(),
			}),
		]);
	}
}