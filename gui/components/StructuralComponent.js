import {Component} from "../index.js";
import {extend} from "../../utils/index.js";

/**
 * @extends Component
 * @param {{children: Component[]}}
 */
export function StructuralComponent({children}) {
	Component.apply(this, arguments);

	/** @override */
	this.computePosition = function(initial, parentSize) {
		const align = this.getAlign();
		const size = this.getSize();
		const m = this.getMargin();
		const o = parentSize.subtract(size);

		initial = initial.add(m);

		switch (align) {
			case Component.alignCenterTop:
			case Component.alignCenter:
			case Component.alignCenterBottom:
				initial.x += o.x * .5;

				break;
			case Component.alignRightTop:
			case Component.alignRightCenter:
			case Component.alignRightBottom:
				initial.x = o.x - m.x;

				break;
		}

		switch (align) {
			case Component.alignLeftCenter:
			case Component.alignCenter:
			case Component.alignRightCenter:
				initial.y += o.y * .5;

				break;
			case Component.alignLeftBottom:
			case Component.alignCenterBottom:
			case Component.alignRightBottom:
				initial.y = o.y - m.y;

				break;
		}

		this.setPosition(initial.floor32());

		const position = this.getPosition();
		const children = this.getChildren();

		for (let i = 0, l = children.length; i < l; i++) {
			children[i].computePosition(position.clone(), size);
		}
	};

	/** @returns {Component[]} */
	this.getChildren = () => children;
}

extend(StructuralComponent, Component);