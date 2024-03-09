import {StructuralComponent} from "./StructuralComponent.js";
import {Vector2} from "../../../math/index.js";

export class Group extends StructuralComponent {
	/**
	 * @param {Vector2} initial Copy of the parent top left corner
	 * @param {Vector2} parentSize Copy of the parent size
	 */
	compute(initial, parentSize) {
		super.compute(initial, parentSize);

		const children = this.getChildren();

		for (let i = 0; i < children.length; i++) {
			children[i].compute(new Vector2(this.getPosition()), new Vector2(this.getSize()));
		}
	}
}