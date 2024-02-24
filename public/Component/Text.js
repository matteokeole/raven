import {BitmapFont} from "../../src/fonts/index.js";
import {GUIComposite} from "../../src/gui/index.js";
import {VisualComponent} from "../../src/gui/Component/index.js";
import {Vector2, Vector4} from "../../src/math/index.js";
import {IncrementCountEvent} from "../Event/IncrementCountEvent.js";

export class Text extends VisualComponent {
	/**
	 * @type {BitmapFont}
	 */
	#font;

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
			events: [
				IncrementCountEvent.NAME,
			],
		});

		this.#font = descriptor.font;

		const {glyphs, size} = this.#font.generateGlyphsFromMultilineString(text, 2, new Vector4(255, 255, 255, 255));

		this.setSize(size);
		this.setTexture(descriptor.context.getTexture(this.#font.getTexturePath()));
		this.setSubcomponents(glyphs);
	}

	/**
	 * @param {Number} carry
	 * @param {GUIComposite} context
	 */
	[IncrementCountEvent.NAME](carry, context) {
		// Clear
		{
			// Set the texture to the same as the background color
			this.setTexture(context.getTexture("white"));

			// Push the component to the render queue
			context.pushToRenderQueue(this);

			// Render the queue
			context.render();
		}

		// Generate the text
		{
			const text = `${carry} clicks`;
			const {glyphs, size} = this.#font.generateGlyphsFromMultilineString(text, 2, new Vector4(255, 255, 255, 255));

			this.setSize(size);
			this.setTexture(context.getTexture(this.#font.getTexturePath()));
			this.setSubcomponents(glyphs);
		}

		// Render
		{
			// Re-compute the currently rendered layers,
			// because the component's size has changed
			context.compute();

			// Push the component to the render queue
			context.pushToRenderQueue(this);

			// Render the queue
			context.render();
		}
	}
}