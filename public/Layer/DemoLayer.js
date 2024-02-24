import {GUIComposite, Layer} from "../../src/gui/index.js";
import * as Alignment from "../../src/gui/Alignment/index.js";
import {MouseDownEvent} from "../../src/gui/Event/index.js";
import {Vector2} from "../../src/math/index.js";
import {Button} from "../Component/Button.js";
import {Group} from "../Component/Group.js";
import {Text} from "../Component/Text.js";

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
				new Button({
					alignment: Alignment.left | Alignment.top,
					size: new Vector2(64, 64),
					events: [
						MouseDownEvent.NAME,
					],
					texture: context.getTexture("64x64.png"),
				}),
				new Text("0 clicks", {
					alignment: Alignment.left | Alignment.center,
					margin: new Vector2(80, 0),
					font: context.getFont("quiver"),
					context,
				}),
			],
		});
	}
}