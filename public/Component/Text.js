import {BitmapFont} from "../../src/fonts/index.js";
import {GUIComposite} from "../../src/gui/index.js";
import {VisualComponent} from "../../src/gui/Component/index.js";
import {Vector2, Vector4} from "../../src/math/index.js";

export class Text extends VisualComponent {
	/**
	 * @param {String} text
	 * @param {Object} descriptor
	 * @param {Number} descriptor.alignment
	 * @param {Vector2} [descriptor.margin]
	 * @param {BitmapFont} descriptor.font
	 * @param {GUIComposite} descriptor.context
	 */
	constructor(text, descriptor) {
		super({
			alignment: descriptor.alignment,
			margin: descriptor.margin,
			size: new Vector2(),
		});

		const {glyphs, size} = descriptor.font.generateGlyphsFromMultilineString(text, 2, new Vector4(255, 255, 255, 255));

		this.setSize(size);
		this.setTexture(descriptor.context.getTexture(descriptor.font.getTexturePath()));
		this.setSubcomponents(glyphs);
	}
}