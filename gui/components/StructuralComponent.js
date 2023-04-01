import {Component} from "../index.js";
import {extend} from "../../utils/index.js";

/**
 * @extends Component
 * @param {{children: Component[]}}
 */
export function StructuralComponent({children}) {
	Component.apply(this, arguments);

	/** @returns {Component[]} */
	this.getChildren = () => children;
}

extend(StructuralComponent, Component);