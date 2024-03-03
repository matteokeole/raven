import {StructuralComponent} from "./StructuralComponent.js";
import {Vector2} from "../../../math/index.js";

export class Group extends StructuralComponent {
	/**
	 * @param {Vector2} initial Cloned parent top left corner
	 * @param {Vector2} parentSize Cloned parent size
	 */
	compute(initial, parentSize) {
		super.compute(initial, parentSize);

		const children = this.getChildren();

		for (let i = 0; i < children.length; i++) {
			children[i].compute(this.getPosition().clone(), this.getSize().clone());
		}
	}
}