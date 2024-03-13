import {Scene} from "./Scene.js";
import {VisualComponent} from "../GUI/Component/index.js";

export class GUIScene extends Scene {
	/**
	 * @type {Number}
	 */
	#subcomponentCount;

	constructor() {
		super();

		this.#subcomponentCount = 0;
	}

	/**
	 * @returns {VisualComponent[]}
	 */
	getQueue() {
		return super.getQueue();
	}

	getSubcomponentCount() {
		return this.#subcomponentCount;
	}

	/**
	 * @param {VisualComponent} component
	 */
	add(component) {
		this._queue.push(component);

		this.#subcomponentCount += component.getSubcomponents().length;
	}

	clear() {
		super.clear();

		this.resetSubcomponentCount();
	}

	resetSubcomponentCount() {
		this.#subcomponentCount = 0;
	}
}