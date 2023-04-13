import {Component} from "../index.js";
import {extend} from "../../utils/index.js";

/**
 * @abstract
 * @extends Component
 * @param {Object} options
 * @param {Component[]} options.children
 */
export function StructuralComponent({children}) {
	Component.apply(this, arguments);

	/** @override */
	this.compute = function(initial, parentSize) {
		const align = this.getAlign();
		const size = this.getSize();
		const m = this.getMargin();
		const o = parentSize.subtract(size);

		initial.add(m);

		switch (align) {
			case Component.alignCenterTop:
			case Component.alignCenter:
			case Component.alignCenterBottom:
				initial[0] += o[0] * .5;

				break;
			case Component.alignRightTop:
			case Component.alignRightCenter:
			case Component.alignRightBottom:
				initial[0] = o[0] - m[0];

				break;
		}

		switch (align) {
			case Component.alignLeftCenter:
			case Component.alignCenter:
			case Component.alignRightCenter:
				initial[1] += o[1] * .5;

				break;
			case Component.alignLeftBottom:
			case Component.alignCenterBottom:
			case Component.alignRightBottom:
				initial[1] = o[1] - m[1];

				break;
		}

		this.setPosition(initial.floor());

		const position = this.getPosition();
		const children = this.getChildren();

		for (let i = 0, l = children.length; i < l; i++) {
			children[i].compute(position.clone(), size.clone());
		}
	};

	/** @returns {Component[]} */
	this.getChildren = () => children;
}

extend(StructuralComponent, Component);