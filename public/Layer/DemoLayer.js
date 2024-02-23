import {GUIComposite, Layer} from "../../src/gui/index.js";
import * as Alignment from "../../src/gui/Alignment/index.js";
import {Vector2} from "../../src/math/index.js";
import {ColoredBox} from "../Component/ColoredBox.js";
import {Group} from "../Component/Group.js";

export class DemoLayer extends Layer {
	/**
	 * @param {GUIComposite} context
	 */
	build(context) {
		return new Group({
			alignment: Alignment.left | Alignment.top,
			margin: new Vector2(16, 16),
			size: new Vector2(144, 64),
			children: [
				new ColoredBox({
					alignment: Alignment.left | Alignment.top,
					size: new Vector2(64, 64),
					texture: context.getTexture("64x64.png"),
				}),
			],
		});
	}
}