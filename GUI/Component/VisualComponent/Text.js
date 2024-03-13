import {VisualComponent} from "./VisualComponent.js";
import {GUIComposite} from "../../index.js";
import {BitmapFont} from "../../../Font/index.js";
import {Vector2, Vector4} from "../../../math/index.js";

/**
 * @typedef {Object} TextDescriptor
 * @property {Number} alignment
 * @property {Vector2} [margin]
 * @property {String[]} [events]
 * @property {BitmapFont} font
 * @property {Number} [fontSize]
 * @property {Vector4} [colorMask]
 * @property {GUIComposite} context
 */

export class Text extends VisualComponent {
	/**
	 * @param {String} text
	 * @param {TextDescriptor} descriptor
	 */
	constructor(text, descriptor) {
		super({
			alignment: descriptor.alignment,
			margin: descriptor.margin,
			size: new Vector2(0, 0),
			events: descriptor.events,
			texture: descriptor.context.getTexture(descriptor.font.getTexturePath()),
		});

		const fontSize = descriptor.fontSize ?? 1;
		const colorMask = descriptor.colorMask ?? new Vector4(255, 255, 255, 255);

		const {glyphs, size} = descriptor.font.generateGlyphsFromMultilineString(text, fontSize, colorMask);

		this.setSize(size);
		this.setSubcomponents(glyphs);
	}
}