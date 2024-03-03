import {VisualComponent} from "./VisualComponent.js";
import {Subcomponent} from "../../Subcomponent.js";

export class Image extends VisualComponent {
	/**
	 * @param {import("./VisualComponent.js").VisualComponentDescriptor} descriptor
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